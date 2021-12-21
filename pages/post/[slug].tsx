import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import styles from '../../styles/Home.module.scss'

const { BLOG_URL, CONTENT_API_KEY } = process.env;

async function getPost(slug: string) {
	console.log('In getPost')
	const res = await fetch(`${BLOG_URL}/ghost/api/v3/content/posts/slug/${slug}?key=${CONTENT_API_KEY}&fields=title,slug,html`)
		.then((res) => res.json());

	const posts = res.posts;

	return posts[0];
}

export const getStaticProps = async ({ params }) => {
	console.log('In getStaticProps')
	const post = await getPost(params.slug)
	return {
		props: { post },
		revalidate: 10
	}
}

export const getStaticPaths = () => {
	console.log('In getStaticPaths')
	return {
		paths: [],
		fallback: true
	}
}

type Post = {
	title: string,
	html: string,
	slug: string
}

const Post: React.FC<{ post: Post }> = props => {
	console.log(props);

	const { post } = props;
	const [enableLoadComments, setEnableLoadComments] = useState<boolean>(true)
	const router = useRouter();

	if (router.isFallback) {
		return <h1>Loading...</h1>
	}

	function loadComments() {
		setEnableLoadComments(false);
		; (window as any).disqus_config = function () {
			this.page.url = window.location.href;
			this.page.identifier = post.slug;
		};

		const script = document.createElement('script')
		script.src = 'https://ghost-cms-nextjs-3.disqus.com/embed.js';
		script.setAttribute('data-timestamp', Date.now().toString())

		document.body.appendChild(script);
	}

	return (
		<div className={styles.container}>
			<Link href="/"><a>Go back</a></Link>
			<h1>{post.title}</h1>
			<div dangerouslySetInnerHTML={{ __html: post.html }}></div>

			{
				enableLoadComments &&
				<p className={styles.goback} onClick={loadComments}>
					Load Comments
				</p>
			}

			<div id="disqus_thread"></div>
		</div>
	);
}

export default Post;