import React, { useMemo } from 'react';
import ApolloClient from 'apollo-client'
import { ApolloProvider } from '@apollo/react-hooks'
import { createHttpLink } from 'apollo-link-http'
import { setContext } from 'apollo-link-context'
import { InMemoryCache } from 'apollo-cache-inmemory'

import TodoList from './TodoList'

const FAUNA_DB_URI = 'https://graphql.fauna.com/graphql'
const FAUNA_DB_SECRET = process.env.REACT_APP_FAUNA_DB_SECRET

const App = _props => {
  const client = useMemo(_ => {
    const httpLink = createHttpLink({ uri: FAUNA_DB_URI })
    const authLink = setContext((_, { headers }) => ({
      headers: {
        ...headers,
        authorization: `Bearer ${FAUNA_DB_SECRET}`
      }
    }))

    return new ApolloClient({
      link: authLink.concat(httpLink),
      cache: new InMemoryCache()
    })
  }, [])

  return (
    <ApolloProvider client={client}>
      <TodoList />
    </ApolloProvider>
  )
}

export default App;
