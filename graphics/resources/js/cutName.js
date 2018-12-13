function getName(name){
	var len;
	var i;
	var displayName = "";
	for (i = 0; i < name.length; i++) {
		var hexValue = name.charCodeAt(i);
		var value = parseInt(hexValue, 10);
		if (value == 32)
			displayName += "&nbsp;";
		else
			displayName += name.substr(i, 1);				
		var table = document.createElement("table");
		table.style.visibility = "hidden";
		var body = document.createElement("tbody");
		table.appendChild(body);
		var tr = document.createElement("tr");
		body.appendChild(tr);
		var td = document.createElement("td");
		td.setAttribute("noWrap","true");
		td.setAttribute("text-align","center");
		td.innerHTML = "<font size=\"2\">" + displayName + "</font>";
		tr.appendChild(td);
		document.body.insertBefore(table, null);
		len = td.offsetWidth;
		try {
			table.parentNode.removeChild(table);
		} catch (e) {}
		if (len >= 150) {
			break;
		}
	}
	if (i != name.length) {
		displayName = "";
		for (i = 0; i < name.length; i++) {
			var lastName = displayName;
			var hexValue = name.charCodeAt(i);
			var value = parseInt(hexValue, 10);
			if (value == 32)
				displayName += "&nbsp;";
			else
				displayName += name.substr(i, 1);
			var table = document.createElement("table");
			table.style.visibility = "hidden";
			var body = document.createElement("tbody");
			table.appendChild(body);
			var tr = document.createElement("tr");
			body.appendChild(tr);
			var td = document.createElement("td");
			td.setAttribute("noWrap","true");
			td.setAttribute("text-align","center");
			td.innerHTML = "<font size=\"2\">" + displayName + "...</font>";
			tr.appendChild(td);
			document.body.insertBefore(table, null);
			len = td.offsetWidth;
			try {
				table.parentNode.removeChild(table);
			} catch (e) {}
			if (len >= 150) {
				displayName = lastName + "...";
				break;
			}
		}
	}
	return displayName;
}
function addSpace(name, width)
{
	var displayName = "";
	for (var i = 0; i < name.length; i++) {
		var table = document.createElement("table");
		table.style.visibility = "hidden";
		var body = document.createElement("tbody");
		table.appendChild(body);
		var tr = document.createElement("tr");
		body.appendChild(tr);
		var td = document.createElement("td");
		td.width = width;
		td.setAttribute("word-break","break-all");
		td.setAttribute("text-align","center");
		td.innerHTML = "<font size=\"3\">" + displayName + name.substr(i, 1) + "</font>";
		tr.appendChild(td);
		document.body.insertBefore(table, null);
		var len = td.offsetWidth;
		try {
			table.parentNode.removeChild(table);
		} catch (e) {}
		if (len > width) {
			displayName += " ";
		}
		displayName += name.substr(i, 1);
	}
	return displayName;
}

