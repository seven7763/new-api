package model

import (
	"strconv"
	"testing"

	"github.com/QuantumNous/new-api/common"
	"github.com/glebarez/sqlite"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"gorm.io/gorm"
)

// useFreshOptionStore swaps in an empty option store and resets the invite rebate
// globals to the values a process holds right after start, so tests exercise the
// real "boot with zero values, then replay the persisted rows" sequence.
func useFreshOptionStore(t *testing.T) *gorm.DB {
	t.Helper()
	previousDB := DB
	previousMap := common.OptionMap
	previousEnabled := common.InviteTopupRebateEnabled
	previousEnabledAt := common.InviteTopupRebateEnabledAt
	previousRatioBp := common.InviteTopupRebateRatioBp

	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	require.NoError(t, err)
	require.NoError(t, db.AutoMigrate(&Option{}))
	DB = db
	common.OptionMap = map[string]string{}
	common.InviteTopupRebateEnabled = false
	common.InviteTopupRebateEnabledAt = 0

	t.Cleanup(func() {
		DB = previousDB
		common.OptionMap = previousMap
		common.InviteTopupRebateEnabled = previousEnabled
		common.InviteTopupRebateEnabledAt = previousEnabledAt
		common.InviteTopupRebateRatioBp = previousRatioBp
	})
	return db
}

func requireStoredOption(t *testing.T, db *gorm.DB, key string) string {
	t.Helper()
	var stored Option
	require.NoError(t, db.Where(&Option{Key: key}).First(&stored).Error)
	return stored.Value
}

// The rebate cutoff decides which top-ups are grantable, so a restart must replay it
// verbatim. AllOption has no ORDER BY and "InviteTopupRebateEnabled" sorts before
// "InviteTopupRebateEnabledAt" on every supported database, which means the enable row
// is applied while the in-memory cutoff is still the Go zero value.
func TestLoadOptionsFromDatabaseKeepsPersistedInviteRebateCutoff(t *testing.T) {
	db := useFreshOptionStore(t)
	const persisted = "1783867465"
	require.NoError(t, db.Create(&Option{Key: inviteTopupRebateEnabledKey, Value: "true"}).Error)
	require.NoError(t, db.Create(&Option{Key: inviteTopupRebateEnabledAtKey, Value: persisted}).Error)

	options, err := AllOption()
	require.NoError(t, err)
	require.Len(t, options, 2)
	require.Equal(t, inviteTopupRebateEnabledKey, options[0].Key)
	require.Equal(t, inviteTopupRebateEnabledAtKey, options[1].Key)

	loadOptionsFromDatabase()

	assert.True(t, common.InviteTopupRebateEnabled)
	assert.Equal(t, int64(1783867465), common.InviteTopupRebateEnabledAt)
	assert.Equal(t, persisted, common.OptionMap[inviteTopupRebateEnabledAtKey])
	assert.Equal(t, persisted, requireStoredOption(t, db, inviteTopupRebateEnabledAtKey))
}

func TestUpdateOptionStampsInviteRebateCutoffWhenUnstamped(t *testing.T) {
	cases := []struct {
		name        string
		storedValue string
		hasRow      bool
	}{
		{name: "no stored cutoff"},
		{name: "stored cutoff is zero", storedValue: "0", hasRow: true},
		{name: "stored cutoff is blank", hasRow: true},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			db := useFreshOptionStore(t)
			if tc.hasRow {
				require.NoError(t, db.Create(&Option{Key: inviteTopupRebateEnabledAtKey, Value: tc.storedValue}).Error)
			}

			before := common.GetTimestamp()
			require.NoError(t, UpdateOption(inviteTopupRebateEnabledKey, "true"))
			after := common.GetTimestamp()

			stamp, err := strconv.ParseInt(requireStoredOption(t, db, inviteTopupRebateEnabledAtKey), 10, 64)
			require.NoError(t, err)
			assert.GreaterOrEqual(t, stamp, before)
			assert.LessOrEqual(t, stamp, after)
			assert.Equal(t, stamp, common.InviteTopupRebateEnabledAt)
			assert.Equal(t, strconv.FormatInt(stamp, 10), common.OptionMap[inviteTopupRebateEnabledAtKey])
		})
	}
}

// Re-enabling must keep the original cutoff, otherwise a toggle would retroactively
// disqualify top-ups made while the feature was live.
func TestUpdateOptionKeepsInviteRebateCutoffAcrossToggle(t *testing.T) {
	db := useFreshOptionStore(t)
	const persisted = "1783867465"
	require.NoError(t, db.Create(&Option{Key: inviteTopupRebateEnabledAtKey, Value: persisted}).Error)

	require.NoError(t, UpdateOption(inviteTopupRebateEnabledKey, "true"))
	require.NoError(t, UpdateOption(inviteTopupRebateEnabledKey, "false"))
	require.NoError(t, UpdateOption(inviteTopupRebateEnabledKey, "true"))

	assert.Equal(t, persisted, requireStoredOption(t, db, inviteTopupRebateEnabledAtKey))
}

func TestUpdateOptionsBulkStampsInviteRebateCutoff(t *testing.T) {
	db := useFreshOptionStore(t)

	before := common.GetTimestamp()
	require.NoError(t, UpdateOptionsBulk(map[string]string{
		inviteTopupRebateEnabledKey: "true",
		"InviteTopupRebateRatioBp":  "250",
	}))
	after := common.GetTimestamp()

	stamp, err := strconv.ParseInt(requireStoredOption(t, db, inviteTopupRebateEnabledAtKey), 10, 64)
	require.NoError(t, err)
	assert.GreaterOrEqual(t, stamp, before)
	assert.LessOrEqual(t, stamp, after)
	assert.Equal(t, stamp, common.InviteTopupRebateEnabledAt)
	assert.Equal(t, 250, common.InviteTopupRebateRatioBp)
}
