"use client";

import { motion } from "framer-motion";
import { forwardRef } from "react";

import { QrCodeUtil } from "@/utils/QRCodeUtil";

type QrCodeProps = {
  uri: string;
  size?: number;
};

const containerAnimStates = {
  hidden: { opacity: 0, scale: 0.75, origin: "center" },
  show: {
    opacity: 1,
    scale: 1,
    origin: "center",
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
