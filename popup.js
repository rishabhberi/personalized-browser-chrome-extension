document.addEventListener('DOMContentLoaded', function() {
  var checkPageButton = document.getElementById('checkPage');
  checkPageButton.addEventListener('click', function() {

    chrome.tabs.getSelected(null, function(tab) {
      d = document;

      var f = d.createElement('form');
      f.action = 'http://gtmetrix.com/analyze.html?bm';
      f.method = 'post';
      var i = d.createElement('input');
      i.type = 'hidden';
      i.name = 'url';
      i.value = tab.url;
      f.appendChild(i);
      d.body.appendChild(f);
      f.submit();
    });
  }, false);
}, false);

window.str = new String("ID,URL,Visits,Transition,Time\n");

function getVisits(historyItem){
  return new Promise(function(resolve, reject){
    chrome.history.getVisits({url: historyItem.url}, function(visitItem){
      resolve({
        historyItem: historyItem,
        visitItem: visitItem
      });
    });
  });
}

function fetchHistory(){
  return new Promise(function(resolve,reject){
    chrome.history.search({text:''}, function(historyItem){
      resolve(historyItem);
    });
  });
}

fetchHistory().then(function(historyItem){
  return Promise.all(historyItem.map(getVisits));
}).then(function(results){
  // var an = document.getElementById("checkPage");
  // an.innerHTML = results;
  results.forEach(function(result){
    window.str+=result.historyItem.id+","+result.historyItem.url+","+result.historyItem.visitCount;
    result.visitItem.forEach(function(visit){
      window.str+=","+visit.transition+","+(new Date(visit.visitTime)).toString();
    });
    window.str+="\n";
  });
  var file = new Blob([window.str], {type: 'text/plain'});
  var a = document.createElement("a");
  url = URL.createObjectURL(file);
  a.href = url;
  a.download = 'history.csv';
  document.body.appendChild(a);
  a.click();
  setTimeout(function() {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);  
  }, 0);
});

// function call(results){
//   var an = document.getElementById("checkPage");
//   an.innerHTML = "Hello";
//   // for (var i = 0; i < results.length; i++) {
//   //   window.str+=results[i].id+","+results[i].url+","+results[i].visitCount;
//   //   function callback(visits){
//   //     for (var i = 0; i < visits.length; i++){
//   //       window.str += ","+visits[i].transition;
//   //     }
//   //   }
//   //   chrome.history.getVisits({url: results[i].url}, callback);
//   //   window.str+="\n";
//   // }
//   return Promise.all(results.map(getVisits));
//   var file = new Blob([window.str], {type: 'text/plain'});
//   var a = document.createElement("a");
//   url = URL.createObjectURL(file);
//   a.href = url;
//   a.download = 'newFile.txt';
//   document.body.appendChild(a);
//   a.click();
//   setTimeout(function() {
//     document.body.removeChild(a);
//     window.URL.revokeObjectURL(url);  
//   }, 0);
// }

// chrome.history.search({text:''}, call);