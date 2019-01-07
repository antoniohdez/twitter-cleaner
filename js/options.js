function saveOptions( event ) {
    console.log( 'Saving...' );
    const { name, checked } = event.target;

    chrome.storage.sync.set({
        [name]: checked
    }, function() {
        console.log( 'Saved!' );
    });
}

function loadOptions() {
    console.log( "Loading..." );
    chrome.storage.sync.get( null, function( items ) {
        console.log( 'Loaded!' );
        updateOptionsUI( items )
    });
}

function updateOptionsUI( items ) {
    console.log( items );
    Object.entries( items ).forEach( item => {
        const [ key, value ] = item;
        const input = document.querySelector( `input[name="${ key }"]` );
        if ( input ) {
            input.checked = value;
        }
    });
}

document.addEventListener( 'DOMContentLoaded', loadOptions );
document.querySelectorAll( 'input[type="checkbox"]' ).forEach( ( input ) => input.addEventListener( 'change', saveOptions ) );

// Saves options to chrome.storage
function save_options() {
    var color = document.getElementById( 'color' ).value;
    var likesColor = document.getElementById( 'like' ).checked;
    chrome.storage.sync.set({
        favoriteColor: color,
        likesColor: likesColor
    }, function() {
        // Update status to let user know options were saved.
        var status = document.getElementById( 'status' );
        status.textContent = 'Options saved.';
        setTimeout(function() {
            status.textContent = '';
        }, 750);
    });
}
  
// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
    // Use default value color = 'red' and likesColor = true.
    chrome.storage.sync.get({
      favoriteColor: 'red',
      likesColor: true
    }, function( items ) {
      document.getElementById( 'color' ).value = items.favoriteColor;
      document.getElementById( 'like' ).checked = items.likesColor;
    });
}
// document.addEventListener( 'DOMContentLoaded', restore_options );
// document.getElementById( 'save' ).addEventListener( 'click', save_options );