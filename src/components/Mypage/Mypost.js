import React, { useState, useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import Picture from './Picture';
import db from '../../firebase';
import Loader from '../MainArea/Loader';
import styled from 'styled-components';
import '../MainArea/MainGrid.css';
import { useStateValue } from '../../StateProvider';
const MarginContainer = styled.div`
    max-width: 1440px;
    margin: auto;
    margin-top: 90px;
`;

const HeaderContainer = styled.header`
    display: flex;
    justify-content: space-between;
`;

const Title = styled.h4`
    font-style: normal;
    font-weight: 500;
    font-size: 30px;
    line-height: 43px;
    letter-spacing: -0.6px;
`;

const MoodList = styled.ul`
    display: flex;
`;

const Mood = styled.li`
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 60px;
    box-sizing: border-box;
    color: ${(props) => (props.active ? '#ff534b' : '')};
    cursor: pointer;
    font-style: normal;
    font-weight: 300;
    font-size: 26px;
    line-height: 38px;
    letter-spacing: -0.52px;
    &:hover {
        color: #ff534b;
        transition: color 300ms ease-out;
    }
`;

const Container = styled.div`
    width: 1440px;
    margin: 36px 0;
    columns: 3;
    column-gap: 40px;
`;

export default (props) => {
    const [posts, setPosts] = useState([]);
    const [postList, setPostList] = useState([]);
    const [last, setLast] = useState(null);
    const [category, setCategory] = useState('');
    const [hasMore, setHasMore] = useState(true);
    let lists = ['내가 올린 사진', '신기해요', '찜목록'];
    let Friendlists = ['최신', '신기해요', '찜목록'];
    const [{ user }] = useStateValue();
    useEffect(() => {
        if (props.uid) {
            user && user.uid && user.uid === props.uid
                ? setCategory('내가 올린 사진')
                : setCategory('최신');
            const unsubscribe = db
                .collection('posts')
                .orderBy('timestamp', 'desc')
                .where('uid', '==', props.uid)
                .onSnapshot((snapshot) => {
                    setPosts(
                        snapshot.docs.map((doc) => ({
                            id: doc.id,
                            post: doc.data(),
                        }))
                    );
                    setLast(snapshot.docs[snapshot.docs.length - 1]);
                });

            return () => {
                unsubscribe();
            };
        }
    }, [props.uid]);

    const onChagnePost = (e) => {
        let newPostList = [];
        setPosts([]);
        setCategory(e.currentTarget.innerText);
        if (
            e.currentTarget.innerText === '내가 올린 사진' ||
            e.currentTarget.innerText === '최신'
        ) {
            db.collection('posts')
                .orderBy('timestamp', 'desc')
                .where('uid', '==', props.uid)
                .onSnapshot((snapshot) => {
                    setPosts(
                        snapshot.docs.map((doc) => ({
                            id: doc.id,
                            post: doc.data(),
                        }))
                    );
                    setLast(snapshot.docs[snapshot.docs.length - 1]);
                });
        } else {
            let Like_Inter;
            if (e.currentTarget.innerText === '신기해요')
                Like_Inter = 'Interest';
            else Like_Inter = 'Like';
            {
                db.collection('Like_Inter')
                    .where('user', '==', props.uid)
                    .where('type', '==', Like_Inter)
                    .onSnapshot((snapshot) => {
                        newPostList = [...postList];
                        snapshot.docs.map((doc) => {
                            db.collection('posts')
                                .doc(doc.data().postId)
                                .onSnapshot((snapshot) => {
                                    newPostList.push({
                                        id: snapshot.id,
                                        post: snapshot.data(),
                                    });
                                    setPosts([...newPostList]);
                                });
                        });
                    });
            }
        }
    };
    return (
        <MarginContainer>
            <HeaderContainer>
                <Title>게시물</Title>
                <MoodList>
                    {(user && user.uid && user.uid === props.uid
                        ? lists
                        : Friendlists
                    ).map((categoryText) => (
                        <Mood
                            key={categoryText}
                            onClick={onChagnePost}
                            active={categoryText === category ? true : false}
                        >
                            {categoryText}
                        </Mood>
                    ))}
                </MoodList>
            </HeaderContainer>
            <InfiniteScroll
                dataLength={posts.length}
                next={() => setHasMore(false)}
                hasMore={hasMore}
                loader={<Loader />}
            >
                <Container>
                    {posts.map(({ post, id }) => (
                        <Picture
                            uid={post.uid}
                            id={id}
                            key={id}
                            advertising={post.advertising}
                            area={post.area}
                            avatar={post.avatar}
                            heart={post.heart}
                            imageUrl={post.imageUrl}
                            latitude={post.latitude}
                            longitude={post.longitude}
                            mood={post.mood}
                            novelty={post.novelty}
                            rating={post.rating}
                            review={post.review}
                            timestamp={post.timestamp}
                            title={post.title}
                            username={post.username}
                            address={post.address}
                        />
                    ))}
                </Container>
            </InfiniteScroll>
        </MarginContainer>
    );
};
