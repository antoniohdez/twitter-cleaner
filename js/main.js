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

    return tweet;
};

function classifyIndividualTweet( tweet ) {
    const node = tweet.node;
    const data = node.dataset;

    if ( data.youFollow === 'true' ) {
        tweet.context = 'normal';

    } else if ( !!data.retweetId ) {
        tweet.context = 'retweet';

    } else if ( node.classList.contains( 'my-tweet' ) ) {
        tweet.context = 'self';

    } else if ( data.promoted === 'true' ) {
        tweet.context = 'promoted';

    } else if ( [ 'suggest_activity_tweet' ].includes( data.componentContext ) ) {
        tweet.context = 'like';

    } else if ( [ 'suggest_pyle_tweet', 'suggest_sc_tweet' ].includes( data.componentContext ) ) {
        tweet.context = 'suggested';
        
    } else {
        tweet.context = 'missing-case';
    }

    return tweet;
}

function classifyConversationTweet( tweet ) {
    const followingAll = tweet.nodes.reduce(( following, node ) => {
        return following && (
            node.dataset.youFollow === 'true'
            || 
            node.classList.contains( 'my-tweet' ) 
        );
    }, true );

    if ( followingAll ) {
        tweet.context = 'conversation-full-follow';
        //tweet.container.style.background = 'green';
    } else {
        tweet.context = 'conversation-partial-follow';
        //tweet.container.style.background = 'yellow';
    }

    return tweet;
}

function hideTweet( tweet ) {
    chrome.storage.sync.get( [ tweet.context, 'hide' ], function( options ) {
        if ( options[ tweet.context ] ) { // If options is active, it means hide the tweet.
            let node;
            if ( tweet.type === 'tweet' ) {
                node = tweet.node;
            } else if ( tweet.type === 'conversation' ) {
                node = tweet.container;
                
            }

            if ( options[ 'hide' ] ) {
                tweet.node.style.display = 'none';
            } else {
                tweet.node.style.opacity = 0.25;
            }
        }
    })
    
    /*if ( tweet.type === 'tweet' ) {
        tweet.node.prepend( tweet.context );
    } else if ( tweet.type === 'conversation' ) {
        tweet.container.prepend( tweet.context );
    }*/
    
    // tweet.node.style.opacity = 0.25; // This line shouln't be here...
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
    const tweets = Array
        .from( tweetsContainer.children )
        .filter( node => node.tagName.toLowerCase() === 'li' );
    filterItems( tweets );

    // Check for changes in the DOM (timeline only)
    var observer = new MutationObserver( observeTimeline );
    observer.observe( tweetsContainer, { childList: true });

} else {
    // Timeline not loaded???
}