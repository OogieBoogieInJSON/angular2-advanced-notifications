export class AnUtils {
  static generateGuid(): string {
    let r: number;
    let v: number;

    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      r = Math.random() * 16 | 0;
      v = c === 'x' ? r : (r & 0x3 | 0x8);

      return v.toString(16);
    });
  }
}
