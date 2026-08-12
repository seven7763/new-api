package common

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestBuildSEOTitle(t *testing.T) {
	cases := []struct {
		name        string
		seoTitle    string
		titleSuffix string
		globalName  string
		systemName  string
		lang        string
		want        string
	}{
		{
			name:        "explicit title wins over every other input",
			seoTitle:    "  Custom Long Tail Title  ",
			titleSuffix: "ignored suffix",
			globalName:  "Ignored",
			systemName:  "Ignored Too",
			lang:        "en",
			want:        "Custom Long Tail Title",
		},
		{
			name:        "configured suffix is appended to the system name",
			titleSuffix: "  Unified Model Hub  ",
			systemName:  "  Acme Gateway  ",
			lang:        "en",
			want:        "Acme Gateway - Unified Model Hub",
		},
		{
			name:       "empty suffix falls back to the language default",
			systemName: "Acme Gateway",
			lang:       "zh-CN",
			want:       "Acme Gateway - " + DefaultSEOTitleSuffix("zh-CN"),
		},
		{
			name:        "blank system name falls back to the configured global name",
			titleSuffix: "Suffix",
			globalName:  "Configured Site",
			lang:        "en",
			want:        "Configured Site - Suffix",
		},
		{
			name:        "blank names fall back to the built-in brand",
			titleSuffix: "Suffix",
			lang:        "en",
			want:        "New API - Suffix",
		},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			previousTitle, previousSuffix, previousName := SEOTitle, SEOTitleSuffix, SystemName
			t.Cleanup(func() {
				SEOTitle, SEOTitleSuffix, SystemName = previousTitle, previousSuffix, previousName
			})
			SEOTitle = tc.seoTitle
			SEOTitleSuffix = tc.titleSuffix
			SystemName = tc.globalName

			assert.Equal(t, tc.want, BuildSEOTitle(tc.systemName, tc.lang))
		})
	}
}
