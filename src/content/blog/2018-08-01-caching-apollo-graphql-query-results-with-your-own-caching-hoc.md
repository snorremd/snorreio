---
title: Caching apollo graphql query results with your own caching hoc
pubDate: "2018-08-01"
modDate: "2018-08-01"
---

I am currently building a search portal at work and have been using a [React](https://reactjs.org/), [Apollo Client](https://www.apollographql.com/docs/react/), and GraphQL stack.

The search app so far is pretty simple. It uses [apollo link state](https://www.apollographql.com/docs/react/essentials/local-state.html) to store local application state like the users' search query and selected filters, and then performs graphql queries based on that state.

The relevant part of the React component tree looks something like this:

_Removed image_

The `search state hoc` graphql component queries the local app state to fetch the user's current search. Any time this state changes, the hoc will re-render the `search results hoc` with new properties (the search to perform).

The `search results hoc` performs a graphql query on the remote graphql server to perform the user specified search against a search index. It passes on three different properties to the child: `error`, `loading`, and `results` which can be used to determine if the query is finished running or not, which can be handled in the child component.

So when the hoc performs the remote query it will pass down the following properties:

    { loading: true, error: false, results: null }

When the query is complete the hoc re-renders the `search presentation component`, but now with the following properties, where results is a nested data structure with search results:

    { loading: false, error: false, results: { ... } }

The problem arises when the user refines her search and the state change triggers a re-render of the `search state hoc` which in turn triggers a re-render of the `search results hoc`. This triggers a new remote query to be performed, and the `search results hoc` will re-render the `search presentation component` with a loading state:

    { loading: true, error: false, results: null }

Because no results are available while loading, any downstream presentation component will now have to be rendered without the previous content. In the search portal I'm developing filters are drawn using the aggregation data contained within the `results` value! Whenever the user performs an adjustment to her search the UI would then have to draw the filters without any content before the new result would become available.

To fix this I first turned to the Apollo docs to see if there was a solution to keep former results while the component entered a new loading state. Apparently this was not so easy. The only solution I could see would be to read the Apollo client cache directly when `loading` equals `true`. This would require the code to know the old query so that I could fetch the correct cached result. Using the [optimistic ui](https://www.apollographql.com/docs/react/features/optimistic-ui.html) feature did not seem to fit nicely into the flow either.

After some thought it occured to me that it would probably be possible to just create my own cache inbetween the `search result hoc` and `search presentation component`. So after a quick Google search I came up with the following component:

    function cacheSearch (WrappedComponent) {
      return class extends React.Component {
        constructor () {
          super()
          this.state = {
            previousResults: null
          }
        }

        componentWillReceiveProps () {
          if (this.props.results) {
            this.setState(function () {
              return { previousResults: this.props.results }
            })
          }
        }

        render () {
          // Wraps the input component in a container, without mutating it. Good!
          return <WrappedComponent {...this.props} previousResults={this.state.previousResults} />
        }
      }
    }

As you can see the cache hoc is implemented as a function that takes the component to wrap as an argument. The cache component uses the React `state` property on the component instance to hold the previous result (the cache), and the `componentWillReceiveProps` life cycle hook to update the cache. The `render` method simply returns the wrapped component with the properties of the cache component as well as the `previousResults` cache.

Because all React hocs look the same it was easy to integrate into the `compose` call used to hook up graphql hocs to my presentation component:

    export default compose(
      graphql(SEARCH_QUERY, {
        name: 'searchQuery',
        props: searchQueryProps
      }),
      graphql(SEARCH_RESULTS, {
        name: 'searchResults',
        options: searchOptions,
        props: searchProperties
      }),
      cacheSearch // My caching hoc
    )(Search)

This solution with a caching higher order component is nothing ground-breaking, but was not obvious to me at first. It might not be the best approach, but it works well enough and is very easy to grok. So tell me what you think of the approach or suggest a better one if you know one!
