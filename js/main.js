function filterTweet( tweet ) {
    const following = JSON.parse( tweet.dataset.youFollow );
    const retweet = !!tweet.dataset.retweetId;
    const self = tweet.classList.contains( 'my-tweet' ) // My own tweets.

    // If it's content I want to see, then stop execution
    if ( following || retweet || self ) {
        return;
    } else { // If it's undesired content, hide tweet.
        
        tweet.style.opacity = 0.25;
    }
}

function filterConversation( items, container ) {
    const tweets = items
        .map( item => item.querySelector( '.tweet' ))
        .filter( item => item !== null ); // Some long conversation tweets may have a child (a separator) to show only beginning and end of thread.

    const followingAll = tweets.reduce(( following, tweet ) => {
        return following && tweet && JSON.parse( tweet.dataset.youFollow );
    }, true );

    if ( followingAll ) {
        container.style.background = 'green';
    } else {
        container.style.background = 'yellow';
    }
}

function filterItems( items ) {
    Array.from( items ).forEach(( item ) => {
        const itemType = JSON.parse( item.dataset.suggestionJson || '{}' ).scribe_component;

        if ( itemType === 'tweet' ) {
            const tweet = item.querySelector( '.tweet' );

            filterTweet( tweet );

        } else if ( itemType === 'conversation' ) {
            const items = Array.from( item.querySelector( '.conversation-module' ).children );
            
            filterConversation( items, item );
        } else {
            // Any other types???
        }
    });
}

function observeTimeline( mutations, observer ) {
    mutations.forEach(( mutation ) => {
        if ( mutation.type === 'childList' && mutation.addedNodes.length > 0 )  {
            const items = Array
                .from( mutation.addedNodes )
                .filter( 
                    node => node.tagName.toLowerCase() === 'li'
                );

            filterItems( items );
        }
    });
}

const tweetsContainer = document.querySelector( '#stream-items-id' );

if ( tweetsContainer ) {
    const tweets = tweetsContainer.children;
    filterItems( tweets );

    // Check for changes in the DOM (timeline only)
    var observer = new MutationObserver( observeTimeline );
    observer.observe(tweetsContainer, { childList: true });

} else {
    // Check this case...
}