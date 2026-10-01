import { Link } from 'react-router-dom';
import { Empty } from '../components/Bits';

export default function NotFound() {
  return <Empty icon="search" title="This page does not exist" text="The link may be old or mistyped."
    action={<Link to="/" className="btn">Go to homepage</Link>} />;
}
