import jwt from 'jsonwebtoken';

export function authenticateToken(request) {
  const authHeader = request.headers.get('authorization');
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return { error: 'Access token required', status: 401 };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return { user: decoded };
  } catch (error) {
    return { error: 'Invalid or expired token', status: 403 };
  }
}

export function requireAuth(handler) {
  return async (request, context) => {
    const auth = authenticateToken(request);
    
    if (auth.error) {
      return Response.json(
        { error: auth.error },
        { status: auth.status }
      );
    }

    // Add user to request context
    request.user = auth.user;
    
    return handler(request, context);
  };
}
