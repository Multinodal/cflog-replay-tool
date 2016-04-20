
function remove(arr, item) {
    for(var i = arr.length; i--;) if(arr[i] == item) arr.splice(i, 1);
}
 
function remove_parts(uri, char, parts) {
    var p = uri.split(char), c = p.length;
 
    if( !p[0].length ) remove(p, p[0]);
    while(c--) if( parts[c] == true ) remove(p, p[c]);
    return p.join(char);
}
 
function test(prefix, uri) {
    return prefix + remove_parts(uri, '/', {0:true});   
}
 
console.log("Started with: %s", "/196951b7-6e54-4046-8c8c-787fc6821bc8/19/310137/484700.jpg");
 
console.log("Returned with: " + test("/mapview/yx/", "/196951b7-6e54-4046-8c8c-787fc6821bc8/19/310137/484700.jpg"));