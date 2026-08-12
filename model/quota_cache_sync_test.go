package model

import (
	"testing"

	"github.com/QuantumNous/new-api/common"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// TransferAffQuotaToQuota 是邀请返佣进入可消费余额的主要入口。预扣在缓存存在期间
// 以 user:<id> 哈希的 Quota 为准，所以数据库涨了而缓存没跟上，用户在缓存过期前
// 既看不到也用不了刚转过来的额度；反过来，事务回滚却补了缓存则会凭空造出额度。
// 这里锁定的不变量是：缓存余额当且仅当事务提交时同步，并始终等于数据库余额。
func TestTransferAffQuotaToQuotaKeepsRedisAndDatabaseInSync(t *testing.T) {
	testCases := []struct {
		name         string
		status       int
		affQuota     int
		transfer     int
		wantErr      bool
		wantQuota    int
		wantAffQuota int
	}{
		{
			name:         "committed transfer credits database and cache",
			status:       common.UserStatusEnabled,
			affQuota:     30,
			transfer:     10,
			wantQuota:    17,
			wantAffQuota: 20,
		},
		{
			name:         "insufficient aff quota credits neither",
			status:       common.UserStatusEnabled,
			affQuota:     4,
			transfer:     10,
			wantErr:      true,
			wantQuota:    7,
			wantAffQuota: 4,
		},
		{
			name:         "disabled account credits neither",
			status:       common.UserStatusDisabled,
			affQuota:     30,
			transfer:     10,
			wantErr:      true,
			wantQuota:    7,
			wantAffQuota: 30,
		},
		{
			name:         "amount below the minimum unit credits neither",
			status:       common.UserStatusEnabled,
			affQuota:     30,
			transfer:     3,
			wantErr:      true,
			wantQuota:    7,
			wantAffQuota: 30,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			truncateTables(t)
			useUserCacheMiniRedis(t)

			oldQuotaPerUnit := common.QuotaPerUnit
			common.QuotaPerUnit = 5
			t.Cleanup(func() { common.QuotaPerUnit = oldQuotaPerUnit })

			user := &User{
				Username: "aff-transfer-user",
				AffCode:  "afftr001",
				Status:   tc.status,
				Quota:    7,
				AffQuota: tc.affQuota,
			}
			require.NoError(t, DB.Create(user).Error)
			require.NoError(t, populateUserCache(*user))

			err := user.TransferAffQuotaToQuota(tc.transfer)
			if tc.wantErr {
				require.Error(t, err)
			} else {
				require.NoError(t, err)
			}

			var stored User
			require.NoError(t, DB.First(&stored, user.Id).Error)
			assert.Equal(t, tc.wantQuota, stored.Quota, "database quota")
			assert.Equal(t, tc.wantAffQuota, stored.AffQuota, "database aff quota")

			cached, cacheErr := cacheGetUserBase(user.Id)
			require.NoError(t, cacheErr)
			assert.Equal(t, tc.wantQuota, cached.Quota, "cached quota must equal committed database quota")
		})
	}
}

// 管理员改额写的是绝对值，没有可以补进缓存的增量，只能整体失效哈希。
// 不失效的话，被清零的余额在缓存过期前仍然可以继续消费。
func TestOverrideUserQuotaDropsStaleUserCache(t *testing.T) {
	truncateTables(t)
	useUserCacheMiniRedis(t)

	user := &User{
		Username: "quota-override-user",
		AffCode:  "ovrqt001",
		Status:   common.UserStatusEnabled,
		Quota:    500,
	}
	require.NoError(t, DB.Create(user).Error)
	require.NoError(t, populateUserCache(*user))
	cached, err := cacheGetUserBase(user.Id)
	require.NoError(t, err)
	require.Equal(t, 500, cached.Quota)

	require.NoError(t, OverrideUserQuota(user.Id, 42))

	var stored User
	require.NoError(t, DB.First(&stored, user.Id).Error)
	assert.Equal(t, 42, stored.Quota)

	_, err = cacheGetUserBase(user.Id)
	assert.Error(t, err, "override must drop the stale quota hash")

	rehydrated, err := GetUserCache(user.Id)
	require.NoError(t, err)
	assert.Equal(t, 42, rehydrated.Quota, "next read must hydrate the overridden quota")
}
