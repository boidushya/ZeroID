"use client";

import { QrCodeUtil } from "@/utils/QRCodeUtil";
import { motion } from "framer-motion";
import { forwardRef } from "react";

type QrCodeProps = {
  uri: string;
  size?: number;
};

const containerAnimStates = {
  hidden: { opacity: 0, scale: 0.75, y: 50 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    scale: 0.5,
    y: 50,
    transition: {
      duration: 0.1,
    },
  },
};

const QRCode = forwardRef<HTMLDivElement, QrCodeProps>(
  function QRCodeContent(props, ref) {
    const { uri, size = 304 } = props;
    const qrCodeData = QrCodeUtil.generate(uri, size, size / 4);
    return (
      <motion.div
        variants={containerAnimStates}
        initial="hidden"
        animate="show"
        exit="exit"
        ref={ref}
        className="bg-white p-4 flex w-full aspect-square items-center justify-center relative rounded-[1.75rem]"
      >
        <svg
          height={size}
          width={size}
          dangerouslySetInnerHTML={{ __html: qrCodeData.join("") }}
        ></svg>
        <motion.div
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          className="avatar absolute"
        />
      </motion.div>
    );
  }
);

export default QRCode;
