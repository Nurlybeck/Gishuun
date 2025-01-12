import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '../config/supabaseClient';

const withAuth = (WrappedComponent) => {
  return (props) => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const checkUser = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.push('/login'); // Redirect to login page if not logged in
        } else {
          setLoading(false); // Stop loading if the user is authenticated
        }
      };

      checkUser();
    }, [router]);

    if (loading) {
      return <p>Loading...</p>; // You can replace this with a spinner or any loading component
    }

    return <WrappedComponent {...props} />;
  };
};

export default withAuth;
