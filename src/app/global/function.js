const GlobalFunction = {
   searchEncode(key) {
      return key
         .replace(/%/g, "%25")
         .replace(/`/g, "%60")
         .replace(/#/g, "%23")
         .replace(/\^/g, "%5E")
         .replace(/&/g, "%26")
         .replace(/\+/g, "%2B")
         .replace(/\\/g, "%5C")
         .replace(/\|/g, "%7C")
         .replace(/}/g, "%7D")
         .replace(/]/g, "%5D")
         .replace(/{/g, "%7B")
         .replace(/\[/g, "%5B")
   },
   getUnique(array) {
      var uniqueArray = [];
      for (var value of array) {
         if (uniqueArray.indexOf(value) === -1) {
            uniqueArray.push(value);
         }
      }
      return uniqueArray;
   },
   replaceSymbol(key) {
      return key
         .replace(/!/g, "").replace(/@/g, "").replace(/#/g, "")
         .replace(/\$/g, "").replace(/%/g, "").replace(/\^/g, "")
         .replace(/&/g, "").replace(/\*/g, "").replace(/\(/g, "")
         .replace(/\)/g, "").replace(/_/g, "").replace(/\+/g, "")
         .replace(/-/g, "").replace(/\=/g, "").replace(/{/g, "")
         .replace(/}/g, "").replace(/\[/g, "").replace(/]/g, "")
         .replace(/\\/g, "").replace(/\|/g, "").replace(/:/g, "")
         .replace(/;/g, "").replace(/"/g, "").replace(/'/g, "")
         .replace(/\</g, "").replace(/\>/g, "").replace(/,/g, "")
         .replace(/\./g, "").replace(/\?/g, "").replace(/\//g, "")
   }
}

export { GlobalFunction };