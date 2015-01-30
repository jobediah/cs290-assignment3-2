window.onload = function(){
	getFavorites();
};

var	favorite_list = [];

var files = [];

var Favorites = function(url, description){
	this.url = url;
	this.description = description;
};

var getFavorites = function(){
	//Populate favorites list when page is opened
	storage_url=JSON.parse(localStorage.getItem("favorites"));
	
	for(var i = 0; i < storage_url.length; i++){
		add_to_favorites(storage_url[i].url, storage_url[i].description);
	}
	
	generate_favorite_list();
};

var startUp = function(){
	//Get user data from search results 
    var pages = document.getElementById("pages").value;
    var lang_boxes = document.getElementsByName("lang");
    var languages = []
    for(var i = 0; i < lang_boxes.length; i++){
    	if(lang_boxes[i].type == "checkbox" && lang_boxes[i].checked==true){
    		languages.push(lang_boxes[i].value);
    	}
    }
	
	for(var j = 1; j <= pages; j++){
    	getGist(j, languages);	
    }
    
    files = []; //Clear out files list each time search is initiated
    
};

var getGist = function(page, languages){
   	//Request to server for list
   	var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function(){
        console.log("Success");
        if (httpRequest.readyState === 4) {
            if (httpRequest.status === 200) {
                var data = JSON.parse(httpRequest.responseText);
                parseGist(page, data, languages);
            }
            
            else { console.log("Sorry, something didn't work")}
        }
            
        else {console.log("Not ready");}

    }

    httpRequest.open('GET', 'https://api.github.com/gists/public?page='+page, true);
    httpRequest.send();
};

var parseGist = function(page, data,languages){
    //Filter files and add relevant ones to list
    for(var i = 0; i < data.length; i++){
        var gist = data[i];

        var file_type = Object.keys(gist.files)[0].split(".");
        
        if(languages.length == 0){
        	files.push(gist);
        }
        else{
			for(var j = 0; j < languages.length; j++){
				if(file_type[1] === languages[j]){
				files.push(gist);}
			}
        }
    }
    
    remove_favorites();    
    generate_list();
};

var remove_favorites = function(){
	//Loop through favorite and files list to remove favorites from files.
	for(var i = 0; i < favorite_list.length; i++){
		for(var j = 0; j < files.length; j++){
			if(favorite_list[i].url == files[j].url){
				files.splice(j,1);
			}
		}
	}
	//console.log(files); for debugging
};

var generate_list = function() {
    
    var div = document.getElementById("search_list");
	var data = files;
	
	//Remove old list
	while (div.firstChild) {
  	div.removeChild(div.firstChild);
	}
	
	//Add paragraph header to div element
	var paragraph = document.createElement("p");
	var text_header = document.createTextNode("Search Results:");
	paragraph.appendChild(text_header);
	div.appendChild(paragraph);
	
	//add return search list
    for (var i = 0; i < data.length; i++) {
        
		var listitem = document.createElement("li");
		var description = data[i].description;
		if(data[i].description == "" || data[i].description == null){description = "no description";}
		var link = document.createElement("a");
		link.setAttribute("href", data[i].html_url)
		var Text = document.createTextNode(description);
		listitem.innerHTML = "<input type='button' name='"+data[i].url+" "+description+"' value='Add to favorites' onclick='on_favorite_click(this.name)'>";
		link.appendChild(Text);
		listitem.appendChild(link);
		div.appendChild(listitem);
    }
};

var on_favorite_click = function(data){
	//Parse values from clicked button
	var items = data.split(" ");
	var url = items[0];
	var description = "";
	for(var i = 1; i < items.length; i++){
		description += " "+items[i];
	}
	//Add data to favorites list
	add_to_favorites(url, description);
};

var add_to_favorites = function(url, description){
	//Add favorite to favorites list
	new_item = new Favorites(url, description);
	favorite_list.push(new_item);
	localStorage.setItem("favorites", JSON.stringify(favorite_list));
	
	//Get favorites list in browser
	generate_favorite_list();
	
	//update files list to exclude favorites
	remove_favorites();
	
	//Generate search list without favorites
	generate_list();
};

var generate_favorite_list = function(){
    var div = document.getElementById("favorites_list");
	
	//Remove old list
	while (div.firstChild) {
  	div.removeChild(div.firstChild);
	}
	
	// add paragraph header to div element favorites list
	var paragraph = document.createElement("p");
	var text_header = document.createTextNode("List of Favorites:");
	paragraph.appendChild(text_header);
	div.appendChild(paragraph);
    
    //Loop through favorites list and add list items to div favorites list
    for(var i = 0; i < favorite_list.length; i++){

		var listitem = document.createElement("li");
		var link = document.createElement("a");
		link.setAttribute("href", favorite_list[i].url)
		var Text = document.createTextNode(favorite_list[i].description);
		link.appendChild(Text);
		listitem.innerHTML = "<input type='button' name='"+favorite_list[i].url+"' value='Remove' onclick='remove_from_favorites(this.name)'>";
		listitem.appendChild(link);
		div.appendChild(listitem);
	}
	
};

var remove_from_favorites = function(data){
	//Loop through favorites list and remove item
	for(var i = 0; i < favorite_list.length; i++){
		console.log(favorite_list[i].url);
		if(favorite_list[i].url == data){
			favorite_list.splice(i,1);
		}
	}
	//Set new local storage with updated list
	localStorage.setItem("favorites", JSON.stringify(favorite_list));
	//Regenerate favorites list on browser
	generate_favorite_list();
	
};
