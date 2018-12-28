const tweetsContainer = document.querySelector( '#stream-items-id' );
let tweets;
if ( tweetsContainer ) {
    tweets = tweetsContainer.querySelectorAll( '[data-item-type="tweet"]' );
} else {
    tweets = [];
}


function filterTweets( tweets ) {
    Array.from( tweets ).forEach(( tweet ) => {
        const dataNode = tweet.querySelector( '[data-you-follow]' );
    
        if ( dataNode ) {
            const following = JSON.parse( dataNode.dataset.youFollow ); // 'JSON.parse' checks for valid boolean values...
            const retweet = dataNode.dataset.retweetId; // Could be 'undefined'
            const self = dataNode.classList.contains( 'my-tweet' ) // My own tweets.
    
            if ( !following && !retweet && !self ) {
                    tweet.style.opacity = 0.25;
            }
    
        } else { // Quoted tweet
            // tweet.style.opacity = 0.25;
        }
    });
}

var observer = new MutationObserver(function(mutations, observer) {
    mutations.forEach(( mutation ) => {
        if ( mutation.type === 'childList' && mutation.addedNodes.length > 0 )  {
            const tweets = Array.from( mutation.addedNodes ).filter(( node ) => 
                node.tagName.toLowerCase() === 'li' &&
                node.dataset.itemType === 'tweet'
            );

            filterTweets( tweets );
        }
    })
});

observer.observe(tweetsContainer, { childList: true });

filterTweets( tweets );