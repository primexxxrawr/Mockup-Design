# Power BI Design Specification & Theme Mapping
**Project:** Dashboard Rekonsiliasi Billing Principal (Bank Mandiri Inspired)  
**Target Platform:** Microsoft Power BI Desktop & Service  
**Canvas Resolution:** 1920 × 1080 (16:9 widescreen layout)  
**Audience:** Non-Technical Senior Management (Executive 5-Second Rule)

---

## 1. Color Palette Tokens

The color scheme is designed for high contrast, calm corporate authority, and strict semantic discipline. **Status colors are reserved exclusively for status indicators** and are never reused for chrome or general data series.

| Token Name | Hex Code | Power BI Role | Usage Guideline |
| :--- | :--- | :--- | :--- |
| `primaryNavy` | `#003A70` | Application Chrome / Title | Full-width header band, primary BMRI series |
| `brandGold` | `#F5A800` | Accent Highlight | Thin header accent line, active tab underline |
| `canvasBg` | `#F4F6F9` | Canvas Background | Light neutral report background |
| `cardBg` | `#FFFFFF` | Visual Tile Container | Flat white rectangular cards |
| `cardBorder` | `#E1E5EB` | Visual Tile Border | 1px border on all tiles and dividers |
| `cardBorderHover` | `#CBD5E1` | Interactive State | Subtle border contrast on card hover |
| `textPrimary` | `#1F2937` | Primary Typography | Headers, KPI values, visual titles |
| `textSecondary` | `#6B7280` | Secondary Typography | KPI plain explanations, axis labels, subtitles |
| `textMuted` | `#9CA3AF` | Inactive / Micro | Footnotes, column gridlines (`#EDEBE9`) |

### Semantic Status Colors (Strictly Reserved)
*Never use these three colors for brand series or non-status visuals.*

| Status Label (Display) | Hex Code | Icon Indicator | Description |
| :--- | :--- | :--- | :--- |
| **Sesuai** (Match) | `#1E8E5A` | Check / Circle (`CheckCircle2`) | Variance within tolerance (Selisih = 0) |
| **Ada Selisih** (Deviasi) | `#C62828` | Exclamation (`AlertCircle`) | Non-zero variance requiring action |
| **Belum Dicek** (Unreconciled) | `#8A93A0` | Clock / Dash (`Clock`) | Awaiting Mandiri internal calculation |

### Card Scheme Identity Colors
*Used only for chart data series and small badges.*

| Principal | Hex Code | Series Role |
| :--- | :--- | :--- |
| **Visa** | `#2B6CB0` | Blue series (invoice fee Visa, Visa lines) |
| **Mastercard** | `#E8832A` | Orange series (charge Mastercard, weekly lines - never red) |

---

## 2. Typography Hierarchy (Segoe UI)

All text elements are rendered in **Segoe UI** to match Microsoft Power BI native visual rendering.

| Style Level | Font Size | Weight | Line Height | Power BI Setting |
| :--- | :--- | :--- | :--- | :--- |
| **Page Question Title** | 20–22 px | Semibold (600) | 1.2 | Text Box / Header Title |
| **KPI Callout Value** | 28–30 px | Semibold (600) | 1.0 | Card Visual > Callout value |
| **Visual Header Title** | 12–13 px | Semibold (600) | 1.2 | Visual > Title text |
| **KPI Plain Explanation**| 11–12 px | Regular (400) | 1.3 | Card Visual > Subtitle text |
| **Body & Axis Labels** | 10.5–11 px | Regular (400) | 1.3 | X-Axis / Y-Axis > Values |
| **Micro Footnote / Status**| 9.5–10 px | Medium / Bold | 1.1 | Badges, Data labels, Footers |

---

## 3. Spacing, Grid, and Tile Dimensions

- **Canvas Grid:** 12-Column Responsive Layout with 12px gutter.
- **Card Padding:** `padding: 12px 14px` (`p-3.5`).
- **Corner Radius:** `2px` (`rounded-[2px]`).
- **Card Shadow:** Subtle elevation `0 1px 2px rgba(0,0,0,0.03)` or flat border.
- **Visual Budget:** Maximum 5 report visuals per executive page (excluding slicers).

### Layout Geometry (1920 × 1080)
1. **Header Ribbon:** Height `52px` full-width band + `40px` tab navigation.
2. **Horizontal Slicers Bar:** Height `44px` compact dropdown slicer bar.
3. **Kesimpulan Banner:** Height ~`52px` directly under slicers.
4. **Data Process Strip:** Height ~`48px` 4-step progress indicator.
5. **KPI Cards Row:** 4 Cards, Height `100px`.
6. **Main Visual Row:** Height `320px` (Main Story 7 cols, Supporting 3 cols + 2 cols).
7. **Perlu Perhatian Table:** Height `240px` Top 5 table with drill-through.
8. **Footer:** Height `34px` containing source note & dummy data disclaimer.

---

## 4. Visual-to-Power BI Standard Visual Mapping

Each visual in this dashboard has a direct, 1-to-1 counterpart in standard Power BI Desktop visuals:

| Dashboard Visual | Standard Power BI Visual Type | Power BI Visual Fields / Configuration |
| :--- | :--- | :--- |
| **Kesimpulan Banner** | *Card (New)* or *Text Box* with conditional text | Dynamic DAX Measure returning text + conditional fill / icon |
| **4 KPI Cards** | *Card (New) Visual* | Measure in Callout Value; Explanation in Subtitle; neutral previous period variance in Reference Label |
| **Alur Rekonsiliasi** | *Shape / Horizontal Process Flow* | 4 static or measure-driven shape cards with state icons |
| **Selisih Visa vs MC** | *Clustered Column Chart* | X-Axis: `Fee Category` or `Bulan`; Y-Axis: `Selisih (Rp)` (Visa `#2B6CB0`, MC `#E8832A`) |
| **Kurva-S Kumulatif** | *Line and Clustered Column Chart* | Shared X-Axis: `Billing Period`; Column Y-Axis: `Deviasi Bulanan (Rp)`; Line Y-Axis: `Cum Fee Visa (USD)` & `Cum Fee BMRI (USD)` |
| **Tren Mingguan** | *Line Chart* | X-Axis: `Minggu`; Y-Axis: `Selisih (Rp)` with direct data points |
| **Komposisi Status** | *Donut Chart* | Legend: `STATUS` (Sesuai, Ada Selisih, Belum Dicek); Values: Count of Records |
| **Current vs Previous** | *Donut Chart* | Legend: `Current or Previous`; Values: Count of Rows |
| **Perlu Perhatian (Top 5)** | *Table / Matrix Visual* with Top N Filter | Filter: Top 5 by `ABS(Selisih)`; Actions: Drill-through enabled to Detail Deviasi page |
| **Matriks Detail Seluruh Kolom** | *Matrix Visual* with Frozen Columns | Rows: `Event ID` / `Invoice ID`; Columns: All 20-24 Schema fields; Stepped layout off; Subtotals at bottom |
| **Slicers (Header Bar)** | *Slicer (Dropdown / Tile style)* | Single select or dropdown slicers with search enabled |
| **Panduan Istilah** | *Bookmark Overlay with Shape + Card* | Power BI Bookmark action triggered by Button `?` with Close button |

---

## 5. Sample Power BI Theme JSON (`theme.json`)

```json
{
  "name": "BankMandiriExecutiveTheme",
  "dataColors": [
    "#2B6CB0",
    "#E8832A",
    "#003A70",
    "#F5A800",
    "#1E8E5A",
    "#C62828",
    "#8A93A0",
    "#4B5563"
  ],
  "background": "#F4F6F9",
  "foreground": "#1F2937",
  "tableAccent": "#003A70",
  "visualStyles": {
    "*": {
      "*": {
        "outspacePane": [
          {
            "backgroundColor": { "solid": { "color": "#F4F6F9" } }
          }
        ],
        "border": [
          {
            "show": true,
            "color": { "solid": { "color": "#E1E5EB" } },
            "radius": 2
          }
        ],
        "dropShadow": [
          {
            "show": false
          }
        ],
        "title": [
          {
            "fontColor": { "solid": { "color": "#1F2937" } },
            "fontSize": 12,
            "fontFamily": "Segoe UI Semibold"
          }
        ],
        "subTitle": [
          {
            "fontColor": { "solid": { "color": "#6B7280" } },
            "fontSize": 10.5,
            "fontFamily": "Segoe UI"
          }
        ]
      }
    },
    "card": {
      "*": {
        "labels": [
          {
            "color": { "solid": { "color": "#1F2937" } },
            "fontSize": 28,
            "fontFamily": "Segoe UI Semibold"
          }
        ],
        "categoryLabels": [
          {
            "color": { "solid": { "color": "#6B7280" } },
            "fontSize": 11,
            "fontFamily": "Segoe UI"
          }
        ]
      }
    }
  }
}
```
