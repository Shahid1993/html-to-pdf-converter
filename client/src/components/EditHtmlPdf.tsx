import * as React from 'react'
import { Form, Button, Grid, Loader } from 'semantic-ui-react'
import Auth from '../auth/Auth'
import { getHtmlPdf, patchHtmlPdf } from '../api/htmlPdfs-api'

enum UpdateState {
  NoUpdate,
  Update,
}

interface EditHtmlPdfProps {
  match: {
    params: {
      htmlPdfId: string
    }
  }
  auth: Auth
}


interface EditHtmlPdfState {
  title?: string
  author?: string
  subject?: string
  producer?: string
  creator?: string
  updateState: UpdateState
  loadingMetadata: boolean
}

export class EditHtmlPdf extends React.PureComponent<
  EditHtmlPdfProps,
  EditHtmlPdfState
> {
  state: EditHtmlPdfState = {
    title: '',
    author: '',
    subject: '',
    producer: '',
    creator: '',
    updateState: UpdateState.Update,
    loadingMetadata: true
  }

  handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ title: event.target.value })
  }

  handleAuthorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ author: event.target.value })
  }

  handleSubjectChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ subject: event.target.value })
  }

  handleProducerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ producer: event.target.value })
  }

  handleCreatorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ creator: event.target.value })
  }

  handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault()

    try {
      this.setUpdateState(UpdateState.NoUpdate)
      await patchHtmlPdf(this.props.auth.getIdToken(), this.props.match.params.htmlPdfId,{
        title: this.state.title,
        author: this.state.author,
        subject: this.state.subject,
        producer: this.state.producer,
        creator: this.state.creator
      })

      alert('Metadata was updated successfully!')
    } catch (e) {
      alert('Could not update metadata: ' + e.message)
    } finally {
      this.setUpdateState(UpdateState.Update)
    }
  }

  setUpdateState(updateState: UpdateState) {
    this.setState({
      updateState
    })
  }

  async componentDidMount() {
    try {
      const  htmlPdf = await getHtmlPdf(this.props.auth.getIdToken(), this.props.match.params.htmlPdfId)
      this.setState({
        title: htmlPdf.title || '',
        author: htmlPdf.author || '',
        subject: htmlPdf.subject || '',
        producer: htmlPdf.producer || '',
        creator: htmlPdf.creator || '',
        loadingMetadata: false
      })
    } catch (e) {
      alert(`Failed to fetch metadata for pdf : ${e.message}`)
    }
  }

  render() {
    if (this.state.loadingMetadata){
      return this.renderLoading()
    }

    return (
      <div>
        <h1>Update pdf metadata</h1>

        <Form onSubmit={this.handleSubmit}>
          <Form.Field>
            <label>Title</label>
            <input
              placeholder="Pdf title"
              value={this.state.title}
              onChange={this.handleTitleChange}
            />
          </Form.Field>
          <Form.Field>
            <label>Author</label>
            <input
              placeholder="Pdf author"
              value={this.state.author}
              onChange={this.handleAuthorChange}
            />
          </Form.Field>
          <Form.Field>
            <label>Subject</label>
            <input
              placeholder="Pdf subject"
              value={this.state.subject}
              onChange={this.handleSubjectChange}
            />
          </Form.Field>
          <Form.Field>
            <label>Producer</label>
            <input
              placeholder="Pdf producer"
              value={this.state.producer}
              onChange={this.handleProducerChange}
            />
          </Form.Field>
          <Form.Field>
            <label>Creator</label>
            <input
              placeholder="Pdf creator"
              value={this.state.creator}
              onChange={this.handleCreatorChange}
            />
          </Form.Field>
          {this.renderButton()}
        </Form>
      </div>
    )
  }

  renderButton() {

    return (
      <div>
        <Button
          loading={this.state.updateState == UpdateState.NoUpdate}
          type="submit"
        >Update
        </Button>
      </div>
    )
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading Metadata
        </Loader>
      </Grid.Row>
    )
  }
}
