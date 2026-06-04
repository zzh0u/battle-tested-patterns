use std::collections::{HashMap, HashSet};

struct TombstoneStore {
    data: HashMap<String, String>,
    dead: HashSet<String>,
}

impl TombstoneStore {
    fn new() -> Self {
        Self {
            data: HashMap::new(),
            dead: HashSet::new(),
        }
    }

    fn put(&mut self, key: &str, value: &str) {
        self.data.insert(key.to_string(), value.to_string());
        self.dead.remove(key);
    }

    fn get(&self, key: &str) -> Option<&str> {
        if self.dead.contains(key) {
            return None;
        }
        self.data.get(key).map(|s| s.as_str())
    }

    fn delete(&mut self, key: &str) {
        self.dead.insert(key.to_string());
    }

    fn is_deleted(&self, key: &str) -> bool {
        self.dead.contains(key)
    }

    fn compact(&mut self) {
        for key in self.dead.drain() {
            self.data.remove(&key);
        }
    }

    fn len(&self) -> usize {
        self.data.keys().filter(|k| !self.dead.contains(k.as_str())).count()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_put_get() {
        let mut s = TombstoneStore::new();
        s.put("a", "1");
        assert_eq!(s.get("a"), Some("1"));
    }

    #[test]
    fn test_delete() {
        let mut s = TombstoneStore::new();
        s.put("a", "1");
        s.delete("a");
        assert_eq!(s.get("a"), None);
        assert!(s.is_deleted("a"));
    }

    #[test]
    fn test_reinsert() {
        let mut s = TombstoneStore::new();
        s.put("a", "1");
        s.delete("a");
        s.put("a", "2");
        assert_eq!(s.get("a"), Some("2"));
        assert!(!s.is_deleted("a"));
    }

    #[test]
    fn test_compact() {
        let mut s = TombstoneStore::new();
        s.put("a", "1");
        s.put("b", "2");
        s.delete("a");
        s.compact();

        assert!(!s.is_deleted("a"));
        assert_eq!(s.get("b"), Some("2"));
        assert_eq!(s.len(), 1);
    }
}
