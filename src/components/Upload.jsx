import React from 'react';
import {
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  Box
} from "@mui/material";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const Upload = ({ setTransactions, setView, lastSyncTime, fileUrl, image, handleFile }) => {

  return (
  <>
    <Card
    sx={{
      display: "flex",
      flexDirection: "column",
      width: "100%",
      maxWidth: 480,
      margin: "40px auto",
      borderRadius: 3,
      boxShadow: 4,
      overflow: "hidden",
      position: "relative",
    }}
  >
    {/* Full-width banner image */}
    <CardMedia
      component="img"
      sx={{
        width: "100%",
        height: 160,
        objectFit: "cover",
      }}
      image={image}
      title="Kuvera"
    />

    {/* Upload + Download actions in one row */}
    <CardContent
      sx={{
        display: "flex",
        justifyContent: "center",
        gap: 2,
        padding: 3,
      }}
    >
      <label htmlFor="upload-csv" style={{ flex: 1 }}>
        <Button
          variant="contained"
          component="span"
          color="primary"
          sx={{
            width: "100%",
            height: 48,
            textTransform: "none",
            fontSize: "0.95rem",
            borderRadius: 2,
          }}
          startIcon={<CloudUploadIcon />}
        >
          Upload CSV
        </Button>
      </label>

      <input
        type="file"
        accept=".csv"
        id="upload-csv"
        onChange={handleFile}
        style={{ display: "none" }}
      />

      {fileUrl && (
        <Button
          variant="outlined"
          color="secondary"
          href={fileUrl}
          download="uploaded_transactions.csv"
          sx={{
            flex: 1,
            height: 48,
            textTransform: "none",
            borderRadius: 2,
          }}
        >
          Download CSV
        </Button>
      )}
    </CardContent>

    {/* Last Sync Info */}
    {lastSyncTime && (
      <Box
        sx={{
          position: "absolute",
          bottom: 10,
          right: 10,
          display: "flex",
          alignItems: "center",
          backgroundColor: "rgba(255,255,255,0.9)",
          padding: "4px 8px",
          borderRadius: "12px",
          boxShadow: 1,
        }}
      >
        <CheckCircleIcon sx={{ color: "green", fontSize: 16, mr: 0.5 }} />
        <Typography variant="caption" sx={{ fontWeight: 500, color: "green" }}>
          {lastSyncTime}
        </Typography>
      </Box>
    )}
    </Card>
  </>
  );
};
export default Upload;