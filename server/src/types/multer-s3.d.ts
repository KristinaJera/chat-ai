// src/types/multer-s3.d.ts

// 1) Tell TypeScript about the "multer-s3" module
declare module "multer-s3" {
  import { StorageEngine } from "multer";
  import { S3 } from "aws-sdk";

  interface MulterS3Options {
    s3: S3;
    bucket: string;
    contentType?: any;
    acl?: string;
    key?(req: any, file: any, cb: (err: any, key?: string) => void): void;
  }

  function multerS3(opts: MulterS3Options): StorageEngine;
  namespace multerS3 {
    const AUTO_CONTENT_TYPE: any;
  }

  export = multerS3;
}

// 2) Augment the built-in Express.Multer.File type so TS knows
//    that after upload via multer-s3 you get a `.location` prop.
declare namespace Express {
  namespace Multer {
    interface File {
      /**
       * The public URL returned by multer-s3
       */
      location?: string;
    }
  }
}
