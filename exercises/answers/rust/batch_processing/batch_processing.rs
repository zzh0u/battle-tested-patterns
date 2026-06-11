/// Batch — collects items and flushes them in groups.
///
/// A synchronous, Vec-based implementation that batches items
/// until a size threshold is reached, then automatically flushes.

struct Batch<T> {
    size: usize,
    buffer: Vec<T>,
    batches: Vec<Vec<T>>,
}

impl<T: Clone> Batch<T> {
    fn new(size: usize) -> Self {
        Self {
            size,
            buffer: Vec::new(),
            batches: Vec::new(),
        }
    }

    fn add(&mut self, item: T) {
        self.buffer.push(item);
        if self.buffer.len() >= self.size {
            self.flush();
        }
    }

    fn flush(&mut self) {
        if self.buffer.is_empty() {
            return;
        }
        let batch: Vec<T> = self.buffer.drain(..).collect();
        self.batches.push(batch);
    }

    fn batches(&self) -> &[Vec<T>] {
        &self.batches
    }
}