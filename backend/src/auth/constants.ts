export const jwtConstants = {
  secret: process.env.JWT_SECRET || 'CHANGE_ME_REPLACE_IN_PROD',
  expiresIn: '1h',
};
