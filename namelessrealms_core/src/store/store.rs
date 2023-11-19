pub struct ValueGetSet<'a, T>(pub &'a mut T);

impl<'a, T> ValueGetSet<'a, T> {
    
    pub fn get(&self) -> &T {
        &self.0
    }

    pub fn set(&mut self, value: T) {
        *self.0 = value;
    }
}