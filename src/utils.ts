export default class Utils {
  static Get2dArr(width: number, height: number): number[][] {
    let arr = new Array();

    for (let i = 0; i < width; i++) {
      arr[i] = new Array();
      for (let j = 0; j < height; j++) {
        arr[i][j] = 0;
      }
    }

    return arr;
  }
}
