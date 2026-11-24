# 城温 (City Temp)

查询城市真实气温。数据源：Open-Meteo（无需 API key）。

## 目标平台

| 平台 | 方式 | 产出 |
|------|------|------|
| 🍎 iOS | Capacitor → Xcode | IPA |
| 🤖 Android | Capacitor → Gradle | APK |
| ⌚ 手表 | 触屏 + 窄屏 CSS | 同 APK |
| 💍 智能戒指 | 上下倾切换城市 / 摇一摇刷新 | DeviceOrientation |
| 🦯 智能手杖 | 轻点刷新 / 摆动切换城市 | DeviceMotion |

## 功能

- 输入城市名查询实况气温、体感、湿度、风速
- 常用城市快捷芯片
- 定位当前位置气温
- 穿戴手势控制

## 命令

```bash
npm install
npm test
npm start          # 本地预览 www/
npm run apk:debug  # 打 Android debug APK
```

## 同步说明

改 HTML/JS 后：`npm run build`，再 `npx cap sync android`。

## Harness / Loop（助手）

- 遵循根 `/Users/skat/AGENTS.md`：**Harness Engineering** + **Loop Engineering**
- Guide = 本文件；Sensor = 下方验证命令；同类失误第二次须沉淀规则或测试（棘轮）
- 开干前写清 **Done**；每切片过验证环；显式停止（成功 / 上限 / 无进展 / 人审）
- 详解：`docs/HARNESS_ENGINEERING.md`、`docs/LOOP_ENGINEERING.md`

## 验证环 / Done

```bash
npm install
npm test          # 若有
npm run build     # 或 build:web
npx cap sync android   # 若有 android/
# 可选：JAVA_HOME=…/openjdk@17 npm run apk:debug
```

**Done 示例**：测试通过（若有）+ web 产物进 `www/`/`dist/` + `cap sync` 无报错。可选穿戴未做可搁置，不纳入强制 Done。
