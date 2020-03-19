import React, { useState, useCallback } from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import { useMutation } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import ContentEditable from 'react-contenteditable'
import debounce from 'lodash.debounce'

import Checkbox from '@material-ui/core/Checkbox'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'
import DeleteForeverIcon from '@material-ui/icons/DeleteForever'

const UPDATE_TODO_DEBOUCE_TIMEOUT = 400

const UPDATE_TODO_MUTATION = gql`
  mutation updateTodo($id: ID!, $data: TodoInput!) {
    updateTodo(id: $id, data: $data) {
      _id
      _ts
      body
      done
    }
  }
`

const DELETE_TODO_MUTATION = gql`
  mutation deleteTodo($id: ID!) {
    deleteTodo(id: $id) {
      _id
    }
  }
`

const Root = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 8px;
  background-color: ${props => props.active ? 'whitesmoke' : 'transparent'};
  transition: background-color 200ms;
  padding: 2px 8px;
  box-sizing: border-box;
`

const BodyWrapper = styled(Typography).attrs({ variant: 'body1' })`
  flex-grow: 1;
`

const Body = styled(ContentEditable)`
  width: 100%;
  transition: text-decoration 300ms;

  &:focus {
    outline: none;
  }
`

const Todo = ({ id, body: initialBody, done, onUpdate }) => {
  const [fetching, setFetching] = useState(false)
  const [active, setActive] = useState(false)
  const [body, setBody] = useState(initialBody)

  const [doUpdateTodo] = useMutation(UPDATE_TODO_MUTATION)
  const [doDeleteTodo] = useMutation(DELETE_TODO_MUTATION)

  const useFetching = fn => async (...args) => {
    setFetching(true)

    const variables = { id }

    try {
      await fn(...args)
    } catch (error) {
      console.error(error)
    }

    setFetching(false)
  }

  const updateTodo = useCallback(
    useFetching(async data => {
      const variables = { id, data: { body, done, ...data }}
      const result = await doUpdateTodo({ variables })
      const todo = result.data.updateTodo
      onUpdate(todo._id, todo)
    }),
    [doUpdateTodo]
  )

  const debouncedUpdateTodo = useCallback(
    debounce(updateTodo, UPDATE_TODO_DEBOUCE_TIMEOUT),
    [updateTodo]
  )

  const onDoneChange = useCallback(ev => updateTodo({ done: ev.target.checked }), [updateTodo])

  const onBodyChange = useCallback(ev => {
    const newBody = ev.target.value
    setBody(newBody)

    if (newBody.trim()) {
      debouncedUpdateTodo({ body: newBody })
    } else {
      onDelete()
    }
  }, [updateTodo])

  const onDelete = useCallback(
    useFetching(async _ => {
      const variables = { id }
      const result = await doDeleteTodo({ variables })
      const todo = result.data.deleteTodo
      onUpdate(todo._id, undefined)
    }),
    [doDeleteTodo]
  )

  return (
    <Root
      active={active}
      onMouseEnter={_ => setActive(true)}
      onMouseLeave={_ => setActive(false)}
    >
      <Checkbox
        checked={done}
        disabled={fetching}
        onChange={onDoneChange}
        onFocus={_ => setActive(true)}
        onBlur={_ => setActive(false)}
      />

      <BodyWrapper>
        <Body
          html={body}
          onChange={onBodyChange}
          disabled={fetching}
          onFocus={_ => setActive(true)}
          onBlur={_ => setActive(false)}
          style={{ textDecoration: done ? 'line-through' : 'none' }}
        />
      </BodyWrapper>

      {active && (
        <IconButton
          size='small'
          onClick={onDelete}
          disabled={fetching}
          onFocus={_ => setActive(true)}
          onBlur={_ => setActive(false)}
        >
          <DeleteForeverIcon />
        </IconButton>
      )}
    </Root>
  )
}

Todo.propTypes = {
  id: PropTypes.string.isRequired,
  body: PropTypes.string.isRequired,
  done: PropTypes.bool.isRequired,
  onUpdate: PropTypes.func.isRequired
}

export default Todo
