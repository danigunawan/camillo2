import React from 'react'
import { Link, browserHistory } from 'react-router'
import { Layout, Col, Row, Tag, Icon, Button, message, Input } from 'antd';
const { Header, Content } = Layout;
import moment from 'moment';

import {
  Editor,
  createEditorState,
} from 'medium-draft';

import { observer, inject } from 'mobx-react'

@inject(["PostStore"]) @observer
class Post extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      editorState: createEditorState(), // for empty content
    };
  }
  onEditorStateChange = (editorState) => {
    this.props.PostStore.contentDirty = true
    this.props.PostStore.post.editorState = editorState
  }
  
  getPost = (postId) => {
    this.props.PostStore.getPost(postId)
  }  
  
  componentWillMount() {
    if (this.props.params.id === "new") {
      this.props.PostStore.createPost()
    } else {
      this.props.PostStore.getPost(this.props.params.id)
    }
    this.props.PostStore.post.editMode = (this.props.params.mode === "edit") ? true : false
  }
  
  savePost = () => {
    // todo turn into promise result from above async call
    if (this.props.PostStore.savePost()) {
      message.success("Post saved")
      this.props.PostStore.post.editMode = false
    } else {
      message.error("Cannot save")
    }
  }
  
  editPost = () => { 
    this.props.PostStore.post.editMode = true
  }
  
  cancelEdit = () => { 
    this.props.PostStore.post.editMode = false
  }
  
  handleTitleChange = (e) => {
    this.props.PostStore.contentDirty = true
    this.props.PostStore.post.title = e.target.value
  }
  
  render () {
    const toolbar = { options: ['inline', 'fontSize', 'textAlign', 'list'], 
      inline: {inDropdown: true}, list: {inDropdown: true}, textAlign: { inDropdown: true }
    }
    const post = this.props.PostStore.post
    let editorState = post.loading ? null : post.editorState
    if (!editorState) {
      editorState = createEditorState()
    }
    const postBody = post.loading ? null : post.body
    return (
      <Layout className="ca-layout">
        <Header>
          <Row>
            <Col span={2} offset={20}>
            </Col>
            <Col span={2}>
              {post.editMode &&
                <div>
                  <Button>
                    <Link onClick={this.savePost}>Save</Link>
                  </Button>
                  <Button>
                    <Link onClick={this.cancelEdit}>Cancel</Link>
                  </Button>
                </div>
              }
            </Col>
          </Row>
        </Header>
        <Content className="ca-post">
          {!post.editMode &&
            <Row>
              <Col className="text-center" span={10} offset={7}>
                <Col span={1} offset={23}>
                  {!post.editMode &&
                    <Button>
                      <Link onClick={this.editPost}>Edit</Link>
                    </Button>
                  }
                </Col>
                <hr/>
              </Col>

            </Row>
          }
          <Row>
            <Col span={10} offset={7}>
              
              {!post.editMode &&
                <div>
                <h1 className="ca-post-header">{post.loading ? "loading ..." : post.title}</h1>
                <h5>{ moment(post.created_at).fromNow() }</h5>
                </div>
              }
              {post.editMode &&      
                <Input className="ca-post-title-edit" placeholder={`enter post title`} defaultValue={post.title} onChange={this.handleTitleChange} autoComplete="off" /> 
              }
            </Col>
          </Row>
          <Row>
            <Col span={10} offset={7}>
              {post.editMode &&
                <Editor
                  ref="editor"
                  editorState={editorState}
                  onChange={this.onEditorStateChange} />

              }
              {!post.editMode && 
                <div className="ca-post-body" dangerouslySetInnerHTML={{__html: postBody}}></div>
              }
            </Col>
          </Row>
        </Content>
      </Layout>
    )
  }
}

export default Post