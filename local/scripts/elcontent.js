<!-- VERSION="630@(#) elcontent.js 630.1@(#) 06/20/12 11:17:41"; -->
function elContentToggle(elm) {
	var children = elm.parentNode.parentNode.getElementsByTagName("div");
	for (i = 0; i < children.length; i++) {
		if (children[i].className === "ecContentHide") {
			children[i].className = "ecContentShow";
			elm.className = "ecTitleOpen";
		} else if (children[i].className === "ecContentShow") {
			children[i].className = "ecContentHide";
			elm.className = "ecTitleCollapse";
		}
	}
}

function elContentToggleInit() {
	var toggleContainer = document.getElementById("elContent");
	var toggles = (toggleContainer) ? toggleContainer.getElementsByTagName("span") : null;

	if (toggles) {
		for (i = 0; i < toggles.length; i++) {
			if (toggles[i].className === "ecTitleCollapse") {
				toggles[i].onclick = function() { elContentToggle(this) }
			}
		}
	}
}

