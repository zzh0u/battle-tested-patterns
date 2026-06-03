# Patterns from Game Engines

Game engines push patterns to their limits — every frame counts at 60fps.

| Pattern | Project | Where | What It Does |
|---------|---------|-------|--------------|
| [Object Pool](/patterns/object-pool/) | Godot | [`core/templates/pooled_list.h`](https://github.com/godotengine/godot/blob/master/core/templates/pooled_list.h#L35-L100) | Freelist-based pool for entities, particles, physics bodies |
| [Double Buffering](/patterns/double-buffering/) | SDL | [`src/render/SDL_render.c`](https://github.com/libsdl-org/SDL/blob/main/src/render/SDL_render.c#L5535-L5570) | Front/back buffer swap for tear-free rendering |
| [Free List](/patterns/free-list/) | Godot | [`core/templates/pooled_list.h`](https://github.com/godotengine/godot/blob/master/core/templates/pooled_list.h#L35-L100) | Non-intrusive freelist allocator for O(1) entity alloc/free |
| [Ring Buffer](/patterns/ring-buffer/) | Game audio | Various engines | Lock-free audio streaming buffers between main and audio threads |
| [State Machine](/patterns/state-machine/) | Godot | [`scene/animation/animation_tree.h`](https://github.com/godotengine/godot/blob/master/scene/animation/animation_tree.h) | Animation state machines for character animation blending |
| [Arena Allocator](/patterns/arena-allocator/) | Frame allocators | Common pattern | Per-frame bump allocator — reset every frame, zero free cost |
| [Flyweight](/patterns/flyweight/) | Godot | [`servers/rendering/`](https://github.com/godotengine/godot/tree/master/servers/rendering) | Shared mesh/texture resources referenced by multiple instances |
| [Batch Processing](/patterns/batch-processing/) | Godot / Unity | Render batching | Batch draw calls to minimize GPU state changes |

## Further Reading

- [Godot Engine (GitHub)](https://github.com/godotengine/godot) · [SDL (GitHub)](https://github.com/libsdl-org/SDL)
- [Game Programming Patterns (book)](https://gameprogrammingpatterns.com/) by Robert Nystrom
