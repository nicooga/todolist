import React, { useState, useCallback } from 'react'
import styled from 'styled-components'
import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'

import CssBaseline from '@material-ui/core/CssBaseline'
import Typography from '@material-ui/core/Typography'

import Todo from './Todo'
import TodoForm from './TodoForm'

const Root = styled.div`
  display: flex;
  flex-direction: column;
  width: 100vw;
  min-height: 100vh;
  justify-content: center;
  align-items: center;
  background-color: tomato;
  box-sizing: border-box;
`

const TextBox = styled(Typography)`
  padding: 24px;
  box-sizing: border-box;
`

const List = styled.div`
  display: flex;
  flex-direction: column;
  width: 500px;
  max-width: 100%;
  background-color: wheat;
  border-radius: 8px;
  padding 8px;
  box-sizing: border-box;
`

const LIST_TODOS_QUERY = gql`
  query todos {
    todos {
      data {
        _id
        _ts
        body
        done
      }
    }
  }
`

const TodoList = _props => {
  const [todos, setTodos] = useState({})

  const updateTodo = useCallback((id, data) => setTodos(todos => ({ ...todos, [id]: data })), [])

  useQuery(LIST_TODOS_QUERY, {
    onCompleted(data) {
      data.todos.data.forEach(todo => updateTodo(todo._id, todo))
    },
    onError(error) { throw error }
  })

  return (
    <>
      <CssBaseline />
      <Root>
        <TextBox variant='h5'>
          Hello world. These are your todos
        </TextBox>

        <List>
          {Object.values(todos).map(todo => (
            todo && <Todo
              key={todo._id}
              id={todo._id}
              body={todo.body}
              done={todo.done}
              onUpdate={updateTodo}
            />
          ))}

          <TodoForm onCreate={updateTodo} />
        </List>

        <TextBox variant='body1'>
          Built with &hearts; using React and FaunaDB.
          Hosted by Netlify. <br />
          <a href='http://github.com/nicooga/todolist'>http://github.com/nicooga/todolist</a>
        </TextBox>
      </Root>
    </>
  )
}

export default TodoList
