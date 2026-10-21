# 反馈与支持

这是一个课堂用的《数据结构》互动课件。公开仓库只发布**可运行的成品与文档**，不公开完整源码，也不接收代码 PR。

## 可以反馈什么

| 你想做的事 | 去哪儿 |
|---|---|
| 动画演错了、文字写错了、显示异常 | [Bug 反馈](https://github.com/ch1209498273/ds-animations/issues/new?template=bug_report.md) |
| 想要一个新动画 / 新功能 | [动画许愿](https://github.com/ch1209498273/ds-animations/issues/new?template=feature_request.md) |
| 课堂使用经验、改进建议 | [提 Issue](https://github.com/ch1209498273/ds-animations/issues/new) |
| 二次开发、校本定制、商业授权 | 邮件 **1209498273@qq.com** |
| 安全问题 | 不要开公开 Issue，见 [SECURITY.md](SECURITY.md) |

报 Bug 时请尽量带上：**哪个动画、用了什么输入、操作到第几帧、期望看到什么、实际看到什么**；有截图更好。这样不用来回问就能直接定位。

## 关于源码

- 公开仓库只保留 `index.html`、`a/` 单页、`assets/`、zip/PDF 与文档；**没有 `src/`、`tests/` 与构建脚本**。
- 不接收代码 PR：源码不在公开仓库，公开 PR 无法合并。发现演示或文字问题，提 Issue 即可，维护者会在源码仓库修复后随下一版发布。
- 课件成品按 [CC BY-NC-SA 4.0](LICENSE) 授权，**非商业**使用；商用、定制、二次开发请先联系作者。

## 核对副本出处

如果你拿到一份来历不明的课件副本，可以用仓库里的校验脚本核对：

```bash
python tools/verify_rights.py 那份.html
```

不带私钥时能验证文件是否被改动过；带维护者私钥时还能验证出处。正常情况下应输出 `[WARN]`（完整性吻合、未带私钥）或 `[OK]`（出处与完整性都吻合），`[FAIL]` 表示文件被改过或不是本仓库的产物。

## 支持范围

- **最新发布版**与 `main` 分支上的成品。
- 更早版本保留在 [RELEASES.md](RELEASES.md) 的台账和 [CHANGELOG.md](CHANGELOG.md) 里，但不再单独回补修复。
- 这是一个教学项目，没有付费支持，也没有漏洞赏金；反馈通常会在 3 个工作日内确认。
