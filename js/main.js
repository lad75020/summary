var language = "en";
var providers = 3;
var running = 0;

function activate(){
    if (document.getElementById('title').value.length >0 && document.getElementById('words').value >= 500 && document.getElementById('words').value <= 4000 && running == 0)
        document.getElementById('btnSummary').style.display= "inline"; 
    else
        document.getElementById('btnSummary').style.display= "none";
    if (!document.getElementById("isGemini").checked && !document.getElementById("isChatGPT").checked)
        document.getElementById('btnSummary').style.display= "none";
    if (running >0){
        document.getElementById("wait").style.display = "block";
        document.getElementById("radioLang").style.display = 'none';
        document.getElementById("checkProviders").style.display = 'none';
    }
    if (running == 0){
        document.getElementById("wait").style.display = "none";
        document.getElementById("radioLang").style.display = 'inline';
        document.getElementById("checkProviders").style.display = 'inline';
    }
}

function setProviders(){
    providers = 0;
    if (document.getElementById("isGemini").checked)
        providers +=1;
    if (document.getElementById("isChatGPT").checked)
        providers +=2;
    activate();
}

function displayBook(bookJSON){
    var book = JSON.parse(bookJSON);
    document.getElementById("titleDisplay").innerText = book.title;
    document.getElementById("authorDisplay").innerText = book.author;
    if (providers == 1){
        document.getElementById("gemini").innerText = book.gemini;
        document.getElementById("chatgpt").innerText = "";
    }   
    if (providers == 2){
        document.getElementById("chatgpt").innerText = book.chatgpt;
        document.getElementById("gemini").innerText = "";
    }
    if (providers == 3 && book.chatgpt !="")
        document.getElementById("chatgpt").innerText = book.chatgpt;

    if (providers == 3 && book.gemini != "")
        document.getElementById("gemini").innerText = book.gemini;
}

function checkBookExists(title){
    document.getElementById("btnSummary").style.display = 'none';
    document.getElementById('wait').style.display = 'block';
    document.getElementById("chatgpt").innerText = "";
    document.getElementById("gemini").innerText = "";   
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            if(this.responseText =="N/A")
            {
                if(providers == 1 || providers == 3)
                    getBookFromAI(document.getElementById('title').value, document.getElementById('author').value, document.getElementById('temperature').value, document.getElementById('words').value, language, 1);
                if (providers == 2 || providers==3)
                    getBookFromAI(document.getElementById('title').value, document.getElementById('author').value, document.getElementById('temperature').value, document.getElementById('words').value, language, 2);
            }
            else
                getBookFromDB(this.responseText);
        }}
    xmlhttp.open("POST", "checkDB.php",true);
    xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xmlhttp.send('title='+encodeURI(title)+"&lang="+language);
}

function getAllBooksFromDB(){
    document.getElementById('selBooks').innerHTML = "";
    document.getElementById('wait').style.display = 'block';
    running +=1;
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            allBooks = JSON.parse(this.responseText);
            running -= 1;
            activate();
            for(let key in allBooks){
                var option = document.createElement("option");
                option.text = allBooks[key];
                option.value = key;
                document.getElementById("selBooks").add(option);
            }
            document.getElementById('wait').style.display = 'none'; 
        }}
        xmlhttp.open("GET", "getAllBooks.php",true);
        xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xmlhttp.send();
}

function getBookFromDB(bookID) {
    running +=1;
    document.getElementById("chatgpt").innerText = "";
    document.getElementById("gemini").innerText = "";
    activate();
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            displayBook( this.responseText, 3);
            document.getElementById("title").value = "";
            document.getElementById("author").value = "";
            document.getElementById('wait').style.display = 'none';
            document.getElementById("btnStore").style.display = "none";
            document.getElementById("gemini").contentEditable = false;
            document.getElementById("chatgpt").contentEditable = false;
            document.getElementById("dislikeGemini").style.display = "none";
            document.getElementById("dislikeGPT").style.display = "none";
            running -=1;
            activate();
        }
        else if (this.readyState == 4 && this.status == 500) {
            running -=1;
            activate();
            alert("Error 500 when retrieving summary from DB.");
        }}
    xmlhttp.open("POST", "getSummaryFromDB.php",true);
    xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xmlhttp.send('bookID='+bookID);
}

function getBookFromAI(title, author, temperature, length, language, ai){
    document.getElementById('btnSummary').style.display = 'none';
    document.getElementById("dislikeGemini").style.display = "none";
    document.getElementById("dislikeGPT").style.display = "none";
    document.getElementById("btnStore").style.display = "none";
    running +=1;
    activate();
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            displayBook( this.responseText);
            document.getElementById("title").value = "";
            document.getElementById("author").value = "";
            document.getElementById("gemini").contentEditable = true;
            document.getElementById("chatgpt").contentEditable = true;
            running -=1;
            if (running == 0){
                document.getElementById("btnStore").style.display = "inline";
                document.getElementById("dislikeGemini").style.display = "inline";
                document.getElementById("dislikeGPT").style.display = "inline";
            }
            activate();
        }
        else if (this.readyState == 4 && this.status == 500) {
            running -=1;
            activate();
            alert("Error 500 while requesting AI summary.");
        }}
    xmlhttp.open("POST", "getSummaryFromAI.php",true);
    xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xmlhttp.send('title='+encodeURI(title)+"&author="+encodeURI(author)+"&temp="+temperature+"&language="+language+"&length="+length+"&providers="+ai);
}
function storeBook(title, author, gemini, chatgpt){
    document.getElementById("btnStore").style.display = 'none';
    if (title != "???"){     
        activate();
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                getAllBooksFromDB();
                document.getElementById('wait').style.display = 'none';
                document.getElementById("dislikeGemini").style.display = "none";
                document.getElementById("dislikeGPT").style.display = "none";
            }}
        xmlhttp.open("POST", "store.php",true);
        xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        xmlhttp.send('title='+encodeURI(title)+"&author="+encodeURI(author)+"&gemini="+encodeURI(gemini)+"&chatgpt="+encodeURI(chatgpt)+"&lang="+language);
    }
    else
        alert("Unknown book not stored.");
}