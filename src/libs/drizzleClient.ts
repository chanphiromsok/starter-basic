import { drizzle } from "drizzle-orm/libsql/web";

import { createClient } from "@libsql/client/web";
const client = createClient({
  url: "libsql://eas-chanphiromsok.aws-ap-northeast-1.turso.io",
  authToken:
    "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NDg5MzY3OTYsImlkIjoiNjJlYzIxMjgtY2YyMy00ZDUxLTkxZjgtM2U0MmMxMGZmNGZiIiwicmlkIjoiYTI4MDZiMzAtMjVhMC00NmJkLTliNzktNjJlNDE3MTU5ZGJjIn0.sulfwyDjOgda0jo1CvJmBYybBdrnRppNZuZhrNe0iMBG5OMUWkNXCVCUjCZ5xghVB2tUstO0zj43xKh--Xk8BQ",
});

const db = drizzle({ client });

export { db };

