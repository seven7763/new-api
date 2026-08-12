package model

import (
	"testing"

	"github.com/QuantumNous/new-api/common"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

// 易支付是唯一在 model 层内部发放邀请返佣的充值路径（RechargeEpay 提交后调用
// GrantInviteTopupRebate），官方的 TestRechargeEpay* 系列因为返佣功能默认关闭而
// 完全跑不到这段。这里锁定的会计不变量是：一笔成功充值最多发放一次返佣，
// 重复回调不重复发放，返佣失败不回滚被邀请人的入账，功能关闭时不发放。
func TestRechargeEpayGrantsInviteTopupRebateExactlyOnce(t *testing.T) {
	const (
		quotaPerUnit   = 500000
		orderAmount    = 2
		ratioBp        = 100
		wantUserCredit = orderAmount * quotaPerUnit
		wantRebate     = wantUserCredit * ratioBp / 10000
	)

	testCases := []struct {
		name              string
		rebateEnabled     bool
		callbacks         int
		breakRebateLedger bool
		wantInviterAff    int
		wantGrantedRows   int64
	}{
		{
			name:            "enabled feature grants once at the configured ratio",
			rebateEnabled:   true,
			callbacks:       1,
			wantInviterAff:  wantRebate,
			wantGrantedRows: 1,
		},
		{
			name:            "duplicate callback does not grant twice",
			rebateEnabled:   true,
			callbacks:       2,
			wantInviterAff:  wantRebate,
			wantGrantedRows: 1,
		},
		{
			name:              "rebate failure does not undo the user credit",
			rebateEnabled:     true,
			callbacks:         1,
			breakRebateLedger: true,
			wantInviterAff:    0,
			wantGrantedRows:   0,
		},
		{
			name:            "disabled feature grants nothing",
			rebateEnabled:   false,
			callbacks:       1,
			wantInviterAff:  0,
			wantGrantedRows: 0,
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			truncateTables(t)

			oldQuotaPerUnit := common.QuotaPerUnit
			oldEnabled := common.InviteTopupRebateEnabled
			oldRatioBp := common.InviteTopupRebateRatioBp
			oldEnabledAt := common.InviteTopupRebateEnabledAt
			common.QuotaPerUnit = quotaPerUnit
			common.InviteTopupRebateEnabled = tc.rebateEnabled
			common.InviteTopupRebateRatioBp = ratioBp
			// 功能在过去开启，测试订单（现在完成）才算在生效窗口内。
			common.InviteTopupRebateEnabledAt = common.GetTimestamp() - 3600
			t.Cleanup(func() {
				common.QuotaPerUnit = oldQuotaPerUnit
				common.InviteTopupRebateEnabled = oldEnabled
				common.InviteTopupRebateRatioBp = oldRatioBp
				common.InviteTopupRebateEnabledAt = oldEnabledAt
			})

			inviter := &User{Username: "epay_rebate_inviter", AffCode: "epayreb1", Status: common.UserStatusEnabled}
			require.NoError(t, DB.Create(inviter).Error)
			invitee := &User{Username: "epay_rebate_invitee", AffCode: "epayreb2", Status: common.UserStatusEnabled, InviterId: inviter.Id}
			require.NoError(t, DB.Create(invitee).Error)

			order := createEpayTestOrder(t, invitee.Id, "EPAYREBATE", PaymentProviderEpay, common.TopUpStatusPending)

			if tc.breakRebateLedger {
				// 台账写入失败是返佣唯一可注入的故障点：返佣是入账之后的附加动作，
				// 失败只应记日志。
				require.NoError(t, DB.Migrator().DropTable(&InviteRebate{}))
				t.Cleanup(func() { require.NoError(t, DB.AutoMigrate(&InviteRebate{})) })
			}

			for i := range tc.callbacks {
				alreadyDone, err := RechargeEpay(order.TradeNo, "alipay", "127.0.0.1")
				require.NoError(t, err, "callback %d", i+1)
				assert.Equal(t, i > 0, alreadyDone, "callback %d alreadyDone", i+1)
			}

			if tc.breakRebateLedger {
				require.NoError(t, DB.AutoMigrate(&InviteRebate{}))
			}

			assert.Equal(t, wantUserCredit, getUserQuotaForPaymentGuardTest(t, invitee.Id), "invitee credit")
			assert.Equal(t, common.TopUpStatusSuccess, getTopUpStatusForPaymentGuardTest(t, order.TradeNo))

			var storedInviter User
			require.NoError(t, DB.First(&storedInviter, inviter.Id).Error)
			assert.Equal(t, tc.wantInviterAff, storedInviter.AffQuota, "inviter aff_quota")
			assert.Equal(t, tc.wantInviterAff, storedInviter.AffHistoryQuota, "inviter aff_history")

			var grantedRows int64
			require.NoError(t, DB.Model(&InviteRebate{}).
				Where("topup_id = ? AND status = ?", order.Id, InviteRebateStatusGranted).
				Count(&grantedRows).Error)
			assert.Equal(t, tc.wantGrantedRows, grantedRows, "granted ledger rows")
		})
	}
}
