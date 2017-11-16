$(document).ready(function () {
  let count = 1;
  let removeBtnTemplate = $('<button title="Remove Participant" class="remove-btn btn btn-floating waves waves-light red lighten-2"><i class="material-icons">remove</i></button>');
  let results;

  $(".modal").modal();

  $("#add-btn").click( (event) => {
    add();
  });

  $("#reset-btn").click( (event) => {
    count = 0;
    let addBtn = $("#add-btn").detach();
    $("#participant-container").children().remove();
    $("#participant-container").append(addBtn);
    add(true);
  });

  function handleDownloadBtnClickEvent(event) {
    let content = $("#results-modal").find(".modal-content");
    let preloaderOverlay = preloaderFactory(content);
    content.css("position", "relative");
    content.append(preloaderOverlay);
    let successContent = $('<div class="row"><div class="col s12"><h4>Distribute Files</h4><p>Your files are downloading. There is one file per secret santa. Distribute the file to the person it is named after. Inside they will find out to whom they are Secret Santa. Happy gifting!</p></div></div>');
    downloadFiles(results).then( () => {
      content.children().remove();
      content.append(successContent);
    }).catch( (err) => {
      alert(err);
    });
  };

  function handleViewResultsBtnClickEvent(event) {
    renderResultsView(results);
  };

  $(".participant").keyup(enterKeyEventHandler);

  $('#generate-btn').click( (event) => {
    let preloaderOverlay = preloaderFactory($("#main-content"));
    $("#main-content").append(preloaderOverlay);
    initModalContent();
    generateList().then( (assignment) => {
      preloaderOverlay.remove();
      results = assignment;
      $("#results-modal").modal('open');
    }).catch( (err) => {
      alert(err);
    });
  });

  function enterKeyEventHandler(event) {
    if (event.key == "Enter") {
      add();
    }
  }

  function add(omitRemoveButton) {
    let btnContainer = $("#add-btn").parent();
    count++;
    $("#participant-container").append(newParticipant(count));
    if (!omitRemoveButton) {
      let removeBtn = removeBtnTemplate.clone();
      removeBtn.click(remove);
      btnContainer.append(removeBtn);
    }
    document.getElementById('p'+count).focus();
  }

  function remove(event) {
    let id = event.target.id;
    let btnContainer = $(event.target).parent().parent();
    let parentRow = btnContainer.parent();
    parentRow.remove();
    updateParticipantLabels(id);
    count--;
  }

  function updateParticipantLabels(id) {
    let participantInputs = $(".participant");
    participantInputs.each( (index, elem) => {
      let parent = $(elem).parent();
      let label = parent.find("label");
      let i = index+1;
      $(elem).attr("id", "p"+i);
      label.attr('for', 'p'+i);
      label.html("Participant "+i);
    });
  }

  function newParticipant(count) {
    let row = $('<div class="row"></div>');
    let inputField = $('<div class="input-field col s10"></div>');
    let id = 'p'+count;
    let icon = $('<i class="material-icons prefix">account_circle</i>');
    let input = $('<input id="'+id+'" class="participant" type="text">');
    let label = $('<label for="'+id+'">Participant '+count+'</label>');
    input.keyup(enterKeyEventHandler);
    inputField.append(icon);
    inputField.append(input);
    inputField.append(label);
    row.append(inputField);
    let btnContainer = $('<div id="btn-container" class="col s2 center-align">');
    let btn = $('#add-btn').detach();
    btnContainer.append(btn);
    row.append(btnContainer);
    return row;
  }

  function generateList() {
    return new Promise( (resolve, reject) => {
      let participants = $(".participant");
      if (participants.length < 2) {
        reject("Not enough participants... Do you know how this works?");
        return;
      }
      let getters = [];
      let givers = [];
      participants.each( (index, elem) => {
        if (elem.value != null && elem.value != "") {
          getters.push(elem.value);
          givers.push(elem.value);
        }
      });
      let assignment = shuffle(getters, givers);
      resolve(assignment);
    });
  }

  function shuffle(getters, givers) {
    let assignment = {};
    for (let i=0; i < givers.length; i++) {
      let giver = givers[i];
      let index = Math.floor(Math.random() * (getters.length));
      assignment[giver] = getters[index];
      getters.splice(index,1);
    }
    //if it didn't work, try again
    for (let giver in assignment) {
      if (giver == assignment[giver]) {
        return shuffle(Object.keys(assignment), givers);
      }
    }
    return assignment;
  }

  function downloadFiles(results) {
    return new Promise( (resolve, reject) => {
      for (let santa in results) {
        let content = "You are "+results[santa]+"'s secret santa!";
        download(santa, content);
      }
      resolve();
    });
  }

  function download(filename, data) {
    filename += ".txt";
    let blob = new Blob([data], {type: 'text/csv'});
    if(window.navigator.msSaveOrOpenBlob) {
      window.navigator.msSaveBlob(blob, filename);
    } else {
      let elem = window.document.createElement('a');
      elem.href = window.URL.createObjectURL(blob);
      elem.download = filename;
      document.body.appendChild(elem);
      elem.click();
      document.body.removeChild(elem);
    }
  }

  function renderResultsView(results) {
    setPrintStyle();
    let content = $("#results-modal").find(".modal-content");
    content.children().remove();
    let base = $('<div class="col s12"></div>');
    let header = $('<h4>Secret Santas</h4>');
    let printBtn = $('<a id="print-btn" style="float: right; cursor: pointer;"><i class="material-icons">print</i></a>');
    printBtn.click( () => {
      window.print();
    });
    header.append(printBtn);
    let table = $('<table class="striped"></table>');
    let head = $("<thead><tr><th>Secret Santa</th><th>Recipient</th></thead>");
    let body = $('<tbody></tbody>');
    for (let santa in results) {
      let row = $("<tr></tr>");
      let santaCol = $("<td>"+santa+"</td>");
      let recipientCol = $("<td>"+results[santa]+"</td>");
      row.append(santaCol);
      row.append(recipientCol);
      body.append(row);
    }
    table.append(head);
    table.append(body);
    base.append(header);
    base.append(table);
    let baseRow = $('<div class="row"></div>');
    baseRow.append(base);
    content.append(baseRow);
  }

  function initModalContent() {
    let content = $("#results-modal").find(".modal-content");
    content.children().remove();
    content.append($(
      '<div class="row">'+
        '<div class="col s12">'+
          '<h4>View Secret Santas</h4>'+
          '<p>How would you like to view your results? If you are in the secret santa, you might want to download the files so you don\'t ruin the surprise!</p>'+
        '</div>'+
      '</div>'
    ));
    let row = $('<div class="row"></div>');
    let col = $('<div class="col s12 center-align"></div>');
    let viewResultsBtn = $('<button id="view-results" class="btn waves-effect waves-light">View in Browser</button>');
    let downloadBtn = $('<button id="download-results" class="btn waves-effect waves-light">Download Files</button>');
    viewResultsBtn.click(handleViewResultsBtnClickEvent);
    downloadBtn.click(handleDownloadBtnClickEvent);
    col.append(viewResultsBtn);
    col.append(downloadBtn);
    row.append(col);
    content.append(row);
  }

  function preloaderFactory(parent) {
    let preloaderOverlay = parent.clone();
    let preloader = $(
      '<div class="dead-center">'+
        '<div class="preloader-wrapper big active">'+
          '<div class="spinner-layer spinner-green-only">'+
            '<div class="circle-clipper left">'+
              '<div class="circle"></div>'+
            '</div>'+
            '<div class="gap-patch">'+
              '<div class="circle"></div>'+
            '</div>'+
            '<div class="circle-clipper right">'+
              '<div class="circle"></div>'+
            '</div>'+
          '</div>'+
        '</div>'+
      '</div>'
    );
    preloaderOverlay.attr("id", "preloader-overlay");
    preloaderOverlay.children().remove();
    preloaderOverlay.append(preloader);
    return preloaderOverlay;
  }

  function setPrintStyle() {
    let mediaQuery = "@media print {"+
      "body { visibility : hidden }"+
      ".modal-content { visibility : visible }"+
      "#print-btn { visibility : hidden }"+
      ".modal-content { position : absolute; top : 0; left : 0; margin : 0; padding : 0;}"+
      "}";
    $("#print-style").text(mediaQuery);
    $("#results-modal").find(".modal-footer").find("a").click( () => {
      $("#print-style").text("");
    });
  }
});
