import { h, Component } from 'preact';
import VideoPlayer from '../../components/videoPlayer';
import ActiveMetaContainer from '../../components/activeMetaContainer';
import PropTypes from 'prop-types';
import style from './style.scss';

export default class VideoContainer extends Component {
  state = {
    src: '',
    meta: {}
  };

  propTypes = {
    activeVideoId: PropTypes.number,
    data: PropTypes.object
  };

  getVideoById(items, videoId) {
    var result;

    const checkMatch = item => {
      if (item.type === 'video' && item.meta && item.meta.id === videoId) {
        result = item;
        return true;
      }
      return Array.isArray(item.items) && item.items.some(checkMatch);
    };

    items.some(checkMatch);
    return result;
  }

  componentWillReceiveProps(nextProps) {
    const shouldScroll = this.props.activeVideoId !== nextProps.activeVideoId;
    const { activeVideoId, data } = nextProps;

    const video =
      activeVideoId && activeVideoId.length > 0
        ? this.getVideoById(data, activeVideoId)
        : null;

    if (video) {
      this.setState({ ...video });
      if (shouldScroll) {
        window.scroll({ top: 0, left: 0, behavior: 'smooth' });
      }
    }
  }

  render() {
    return (
      <div className={style.wrapper}>
        <VideoPlayer className={style.videoPlayer} src={this.state.src} />
        <ActiveMetaContainer
          className={style.activeMetaContainer}
          meta={this.state.meta}
        />
      </div>
    );
  }
}
