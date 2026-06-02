# Go Runtime 中的模式

Go 的运行时使用 Go 和汇编编写，实现了精巧的调度和内存管理：

| 模式 | Go 中的位置 | 作用 |
|------|------------|------|
| [协作调度](/zh/patterns/cooperative-scheduling/) | `runtime/proc.go` | 带抢占点的 goroutine 调度 |

## 延伸阅读

- [Go 源码 (GitHub)](https://github.com/golang/go)
- [Go Runtime 包文档](https://pkg.go.dev/runtime)
