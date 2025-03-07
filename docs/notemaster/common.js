
// Generate the top navigation menu.
function generateTopMenu() {
    var topMenu = document.getElementById("topMenu");
    var menu = document.createElement("div");
    menu.className = "nav nav-tabs";
    menu.id = "topMenuList";
    topMenu.appendChild(menu);

    var menuItems = ["Identify Note Name", "Match Note to Image"];
    var fileNames = ["index", "learn_note_image"]; // The ".html" extension is added later

    // Get the current page's filename from the pathname
    var currentPage = window.location.pathname.split("/").pop().split(".")[0]; // Extract the filename without extension

    for (var i = 0; i < menuItems.length; i++) {
        var link = document.createElement("a");
        link.className = "nav-link";
        link.href = `./${fileNames[i]}.html`; // Point to respective HTML file
        link.innerHTML = menuItems[i];

        // Check if this link is for the current page
        if (currentPage === fileNames[i]) {
            link.classList.add("active"); // Mark the link as active
        }

        menu.appendChild(link);

        // Add a separator unless it's the last item
        if (i < menuItems.length - 1) {
            var separator = document.createElement("span");
            separator.className = "separator";
            separator.innerHTML = " | ";
            menu.appendChild(separator);
        }
    }
}
