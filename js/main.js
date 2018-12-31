function getTweets( items ) {
    const tweets = items.map( item => {
        const type = JSON.parse( item.dataset.suggestionJson || '{}' ).scribe_component;
        const tweet = { type };

        if ( type === 'tweet' ) {
            tweet.node = item.querySelector( '.tweet' );
            
        } else if ( type === 'conversation' ) {
            tweet.container = item;
            tweet.nodes = Array
                .from( item.querySelector( '.conversation-module' ).children )
                .map( item => item.querySelector( '.tweet' ) )
                .filter( item => item !== null ); // Some long conversation tweets may have a child (a separator) to show only beginning and end of thread.   
        }

        return tweet;
    });

    return tweets;
}

function classifyTweet( tweet ) {
    if ( tweet.type === 'tweet' ) {
        return classifyIndividualTweet( tweet )
    } else if ( tweet.type === 'conversation' ) {
        return classifyConversationTweet( tweet );
    }
};

function classifyIndividualTweet( tweet ) {
    const node = tweet.node;
    const data = node.dataset;

    const following = JSON.parse( data.youFollow );
    const retweet = !!data.retweetId;
    const self = node.classList.contains( 'my-tweet' ) // My own tweets.

    if ( following ) {
        tweet.context = 'following';
    } else if ( retweet ) {
        tweet.context = 'retweet';
    } else if ( self ) {
        tweet.context = 'self';
    } else {
        // Content I don't want to see...
        node.style.opacity = 0.25; // This line shouln't be here...
    }

    return tweet;
}

function classifyConversationTweet( tweet ) {
    const followingAll = tweet.nodes.reduce(( following, node ) => {
        return following && (
            JSON.parse( node.dataset.youFollow ) 
            || 
            node.classList.contains( 'my-tweet' ) 
        );
    }, true );

    if ( followingAll ) {
        tweet.context = 'conversation-full-follow';
        tweet.container.style.background = 'green';
    } else {
        tweet.context = 'conversation-partial-follow';
        tweet.container.style.background = 'yellow';
    }

    return tweet;
}

function hideTweet( tweet ) {
    
}

function filterItems( items ) {
    getTweets( items )
        .map( classifyTweet )
        .map( hideTweet );
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
    const tweets = Array.from( tweetsContainer.children );
    filterItems( tweets );

    // Check for changes in the DOM (timeline only)
    var observer = new MutationObserver( observeTimeline );
    observer.observe( tweetsContainer, { childList: true });

} else {
    // Timeline not loaded???
}