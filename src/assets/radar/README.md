`MajRadarBG.png` is copied unchanged from TeamMajdata/MajdataPlay,
`Assets/Sprites/Ribbon/MajRadarBG.png` at commit
`dc19722d602f099131d93b37091624ad30150ad1`.

The axis fill/outline colors in `src/utils/radar.ts` come from that revision's
`Assets/Scenes/List.unity`. Polygon orientation and the 0.5-second transition
follow `MajRadar.shader` and `MajRadarDisplayer.cs`.

The web UI places 100 at the reference hexagon's vertices. Scores above 100
extend linearly beyond it. The grid and label spacing reserve headroom for
roughly 220; larger values still extend without clamping or rescaling the chart.

Source: https://github.com/TeamMajdata/MajdataPlay/tree/dc19722d602f099131d93b37091624ad30150ad1
