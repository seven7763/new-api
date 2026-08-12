package model

import (
	"fmt"
	"testing"

	"github.com/QuantumNous/new-api/common"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func createLeaderboardInviter(t *testing.T, username string, affCode string, inviteeCount int, rebateQuota int, topupId int) *User {
	t.Helper()
	inviter := &User{Username: username, AffCode: affCode, Status: common.UserStatusEnabled}
	require.NoError(t, DB.Create(inviter).Error)
	for i := range inviteeCount {
		invitee := &User{
			Username:  fmt.Sprintf("%s_invitee_%d", username, i),
			AffCode:   fmt.Sprintf("%s%02d", affCode, i),
			Status:    common.UserStatusEnabled,
			InviterId: inviter.Id,
		}
		require.NoError(t, DB.Create(invitee).Error)
	}
	if rebateQuota > 0 {
		require.NoError(t, DB.Create(&InviteRebate{
			InviterId:   inviter.Id,
			InviteeId:   inviter.Id,
			TopupId:     topupId,
			TradeNo:     fmt.Sprintf("LB-%d", topupId),
			TopupQuota:  rebateQuota * 100,
			RebateQuota: rebateQuota,
			RatioBp:     100,
			Status:      InviteRebateStatusGranted,
			CreatedAt:   common.GetTimestamp(),
		}).Error)
	}
	return inviter
}

// 榜单原本每次请求都要跑两轮全表聚合（榜单一次，榜外查看者的名次再一次）。
// 现在两者都从同一份短 TTL 快照解析。这里锁定的契约是：名次与展示条数解耦、
// 排序 metric 是缓存键的一部分、查看者相关的字段不进缓存，
// 以及 Redis 未启用时降级到进程内缓存后行为不变。
func TestListInviteRebateLeaderboardServesRanksFromCachedSnapshot(t *testing.T) {
	truncateTables(t)

	oldRedisEnabled := common.RedisEnabled
	common.RedisEnabled = false
	cache := getInviteRebateLeaderboardCache()
	require.NoError(t, cache.Purge())
	t.Cleanup(func() {
		_ = cache.Purge()
		common.RedisEnabled = oldRedisEnabled
	})

	createLeaderboardInviter(t, "lb_top", "lbtop", 3, 3000, 9001)
	createLeaderboardInviter(t, "lb_mid", "lbmid", 2, 2000, 9002)
	viewer := createLeaderboardInviter(t, "lb_low", "lblow", 1, 1000, 9003)

	items, myRank, err := ListInviteRebateLeaderboard("rebate", 2, viewer.Id)
	require.NoError(t, err)
	require.Len(t, items, 2, "limit must slice the snapshot")
	assert.Equal(t, 1, items[0].Rank)
	assert.Equal(t, int64(3000), items[0].RebateQuotaSum)
	assert.Equal(t, int64(3), items[0].InviteeCount)
	assert.Equal(t, "l*****", items[0].Username, "cached rows must stay masked")
	assert.Empty(t, items[0].DisplayName)
	assert.False(t, items[0].IsMe)
	assert.Zero(t, items[0].UserId, "other rows must not leak a raw user id")
	assert.Equal(t, int64(2000), items[1].RebateQuotaSum)
	assert.Equal(t, 3, myRank, "off-board rank must resolve from the snapshot beyond the display limit")

	// 同一 TTL 窗口内的新返佣不改变已缓存的快照。
	require.NoError(t, DB.Create(&InviteRebate{
		InviterId:   viewer.Id,
		InviteeId:   viewer.Id,
		TopupId:     9100,
		TradeNo:     "LB-9100",
		TopupQuota:  999900,
		RebateQuota: 9999,
		RatioBp:     100,
		Status:      InviteRebateStatusGranted,
		CreatedAt:   common.GetTimestamp(),
	}).Error)

	cachedItems, cachedRank, err := ListInviteRebateLeaderboard("rebate", 2, viewer.Id)
	require.NoError(t, err)
	require.Len(t, cachedItems, 2)
	assert.Equal(t, int64(3000), cachedItems[0].RebateQuotaSum, "cache hit must not re-aggregate")
	assert.Equal(t, 3, cachedRank)

	require.NoError(t, cache.Purge())
	freshItems, freshRank, err := ListInviteRebateLeaderboard("rebate", 2, viewer.Id)
	require.NoError(t, err)
	require.Len(t, freshItems, 2)
	assert.Equal(t, int64(10999), freshItems[0].RebateQuotaSum)
	assert.Equal(t, 1, freshRank)
	assert.True(t, freshItems[0].IsMe)
	assert.Equal(t, viewer.Id, freshItems[0].UserId, "viewer may see their own raw user id")

	// 排序 metric 是缓存键的一部分：按邀请人数排序必须重新聚合，
	// 而不是复用按返佣排序的快照（复用的话查看者会是第 1 名）。
	inviteeItems, inviteeRank, err := ListInviteRebateLeaderboard("invitees", 3, viewer.Id)
	require.NoError(t, err)
	require.Len(t, inviteeItems, 3)
	assert.Equal(t, int64(3), inviteeItems[0].InviteeCount)
	assert.Equal(t, int64(2), inviteeItems[1].InviteeCount)
	assert.Equal(t, int64(1), inviteeItems[2].InviteeCount)
	assert.Equal(t, 3, inviteeRank)
}
