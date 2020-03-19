import React, { useState, useCallback } from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import { useMutation } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import MuiTextField from '@material-ui/core/TextField'

const CREATE_TODO_MUTATION = gql`
  mutation createTodo($data: TodoInput!) {
    createTodo(data: $data) {
      _id
      _ts
      body
      done
    }
  }
`

const Root = styled.form`
  width: 100%;
  padding: 16px 20px;
  box-sizing: border-box;
`

const TextField = styled(MuiTextField)`
  width: 100% !important;
  box-sizing: border-box;
`

const TodoForm = ({ onCreate }) => {
  const [value, setValue] = useState('')
  const [fetching, setFetching] = useState(false)

  const [createTodo] = useMutation(CREATE_TODO_MUTATION)

  const onSubmit = async ev => {
    ev.preventDefault()

    setFetching(true)

    const variables = { data: { body: value, done: false }}
    const result = await createTodo({ variables })

    setFetching(false)
    setValue('')

    const todo = result.data.createTodo

    onCreate(todo._id, todo)
  }

  return (
    <Root onSubmit={onSubmit}>
      <TextField
        value={value}
        onChange={ev => setValue(ev.target.value)}
        disabled={fetching}
        placeholder='Add another todo'
      />
    </Root>
  )
}

TodoForm.propTypes = {
  onCreate: PropTypes.func.isRequired
}

export default TodoForm
