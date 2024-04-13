import { customAlphabet } from 'nanoid';
// Create a custom nanoid generator for generating short URLs
const nanoidGenerator = customAlphabet(
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
  5
);

export default nanoidGenerator;
