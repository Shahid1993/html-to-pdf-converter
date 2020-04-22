import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import * as validUrl from 'valid-url'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader
} from 'semantic-ui-react'

import { createHtmlPdf, deleteHtmlPdf, getHtmlPdfs, patchHtmlPdf } from '../api/htmlPdfs-api'
import Auth from '../auth/Auth'
import { HtmlPdf } from '../types/HtmlPdf'

interface HtmlPdfsProps {
  auth: Auth
  history: History
}

interface HtmlPdfsState {
  htmlPdfs: HtmlPdf[]
  newHtmlPdfUrl: string
  loadingHtmlPdfs: boolean
}

export class HtmlsPdfs extends React.PureComponent<HtmlPdfsProps, HtmlPdfsState> {
  state: HtmlPdfsState = {
    htmlPdfs: [],
    newHtmlPdfUrl: '',
    loadingHtmlPdfs: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newHtmlPdfUrl: event.target.value })
  }

  onEditButtonClick = (htmlPdfId: string) => {
    this.props.history.push(`/htmlpdfs/${htmlPdfId}/edit`)
  }

  onHtmlPdfCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      if (!validUrl.isUri(this.state.newHtmlPdfUrl)){
        alert('Not a valid url')
        return
      }
      const newHtmlPdf = await createHtmlPdf(this.props.auth.getIdToken(), {
        url: this.state.newHtmlPdfUrl
      })
      this.setState({
        htmlPdfs: [...this.state.htmlPdfs, newHtmlPdf],
        newHtmlPdfUrl: ''
      })
    } catch {
      alert('HtmlPdf creation failed')
    }
  }

  onHtmlPdfDelete = async (htmlPdfId: string) => {
    try {
      await deleteHtmlPdf(this.props.auth.getIdToken(), htmlPdfId)
      this.setState({
        htmlPdfs: this.state.htmlPdfs.filter(htmlPdf => htmlPdf.htmlPdfId != htmlPdfId)
      })
    } catch {
      alert('HtmlPdf deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const htmlPdfs = await getHtmlPdfs(this.props.auth.getIdToken())
      this.setState({
        htmlPdfs,
        loadingHtmlPdfs: false
      })
    } catch (e) {
      alert(`Failed to fetch htmlPdfs: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">HTML-PDF</Header>

        {this.renderCreateHtmlPdfInput()}

        {this.renderHtmlPdfs()}
      </div>
    )
  }

  renderCreateHtmlPdfInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'add',
              content: 'Generate PDF',
              onClick: this.onHtmlPdfCreate
            }}
            fluid
            actionPosition="left"
            placeholder="Enter url..."
            onChange={this.handleNameChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderHtmlPdfs() {
    if (this.state.loadingHtmlPdfs) {
      return this.renderLoading()
    }

    return this.renderTodosList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading HTML-PDF records
        </Loader>
      </Grid.Row>
    )
  }

  renderTodosList() {
    return (
      <Grid padded>
        {this.state.htmlPdfs.map((htmlpdf, pos) => {
          return (
            <Grid.Row key={htmlpdf.htmlPdfId}>
              <Grid.Column width={12} verticalAlign="middle">
                {htmlpdf.url}
              </Grid.Column>
              <Grid.Column width={2} floated="right">
                <Button
                  href={htmlpdf.pdfUrl}
                  color="linkedin"
                  target="_blank"
                  download>PDF
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(htmlpdf.htmlPdfId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onHtmlPdfDelete(htmlpdf.htmlPdfId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  // calculateDueDate(): string {
  //   const date = new Date()
  //   date.setDate(date.getDate() + 7)

  //   return dateFormat(date, 'yyyy-mm-dd') as string
  // }
}
