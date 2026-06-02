# Linux 内核中的模式

Linux 内核经过 30 多年的打磨，这些模式经受住了数十年真实世界的考验：

| 模式 | Linux 中的位置 | 作用 |
|------|---------------|------|
| [位掩码](/zh/patterns/bitmask/) | `include/uapi/linux/stat.h` | 文件权限位（`rwxrwxrwx`） |
| [最小堆](/zh/patterns/min-heap/) | CFS 调度器 | 完全公平调度器运行队列 |

## 延伸阅读

- [Linux 源码 (GitHub 镜像)](https://github.com/torvalds/linux)
- [Linux 内核文档](https://www.kernel.org/doc/html/latest/)
