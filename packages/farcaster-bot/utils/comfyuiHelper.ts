import axios from 'axios';

export const videoOutputTypeList = ['2D', '3D'];
export type VideoOutputType = '2D' | '3D';
export type OutputType = 'GIF' | 'VIDEO';
export const imgToVideoOutputFormats = ['image/gif', 'video/h264-mp4'];

export class ImageToVideoHelperService {
  private comfyServerUrl: string;

  constructor(
    private readonly comfyuiServerUrl: string,
  ) {
    this.comfyServerUrl = comfyuiServerUrl;
  }

  private getImageTo3DVideoWorkflow() {
    return {
      '3': {
        inputs: {
          seed: 305058994665900,
          steps: 14,
          cfg: 2.9,
          sampler_name: 'lms',
          scheduler: 'karras',
          denoise: 1,
          model: ['14', 0],
          positive: ['10', 0],
          negative: ['10', 1],
          latent_image: ['10', 2],
        },
        class_type: 'KSampler',
        _meta: {
          title: 'KSampler',
        },
      },
      '8': {
        inputs: {
          samples: ['3', 0],
          vae: ['20', 2],
        },
        class_type: 'VAEDecode',
        _meta: {
          title: 'VAE Decode',
        },
      },
      '10': {
        inputs: {
          width: 576,
          height: 576,
          video_frames: 14,
          elevation: 0,
          clip_vision: ['20', 1],
          init_image: ['12', 0],
          vae: ['20', 2],
        },
        class_type: 'SV3D_Conditioning',
        _meta: {
          title: 'SV3D_Conditioning',
        },
      },
      '12': {
        inputs: {
          image: 'image.png',
          upload: 'image',
        },
        class_type: 'LoadImage',
        _meta: {
          title: 'Load Image',
        },
      },
      '14': {
        inputs: {
          min_cfg: 1,
          model: ['20', 0],
        },
        class_type: 'VideoTriangleCFGGuidance',
        _meta: {
          title: 'VideoTriangleCFGGuidance',
        },
      },
      '20': {
        inputs: {
          ckpt_name: 'sv3d_p.safetensors',
        },
        class_type: 'ImageOnlyCheckpointLoader',
        _meta: {
          title: 'Image Only Checkpoint Loader (img2vid model)',
        },
      },
      '22': {
        inputs: {
          frame_rate: 8,
          loop_count: 0,
          filename_prefix: 'sv3d',
          format: 'image/gif',
          pingpong: false,
          save_output: true,
          images: ['8', 0],
        },
        class_type: 'VHS_VideoCombine',
        _meta: {
          title: 'Video Combine 🎥🅥🅗🅢',
        },
      },
    };
  }

  private getImageToVideoWorkflow() {
    return {
      '3': {
        inputs: {
          seed: 0,
          steps: 14,
          cfg: 2.9,
          sampler_name: 'lms',
          scheduler: 'karras',
          denoise: 1,
          model: ['14', 0],
          positive: ['12', 0],
          negative: ['12', 1],
          latent_image: ['12', 2],
        },
        class_type: 'KSampler',
        _meta: {
          title: 'KSampler',
        },
      },
      '8': {
        inputs: {
          samples: ['3', 0],
          vae: ['15', 2],
        },
        class_type: 'VAEDecode',
        _meta: {
          title: 'VAE Decode',
        },
      },
      '12': {
        inputs: {
          width: 512,
          height: 512,
          video_frames: 14,
          motion_bucket_id: 127,
          fps: 6,
          augmentation_level: 0,
          clip_vision: ['15', 1],
          init_image: ['23', 0],
          vae: ['15', 2],
        },
        class_type: 'SVD_img2vid_Conditioning',
        _meta: {
          title: 'SVD_img2vid_Conditioning',
        },
      },
      '14': {
        inputs: {
          min_cfg: 1,
          model: ['15', 0],
        },
        class_type: 'VideoLinearCFGGuidance',
        _meta: {
          title: 'VideoLinearCFGGuidance',
        },
      },
      '15': {
        inputs: {
          ckpt_name: 'svd.safetensors',
        },
        class_type: 'ImageOnlyCheckpointLoader',
        _meta: {
          title: 'Image Only Checkpoint Loader (img2vid model)',
        },
      },
      '23': {
        inputs: {
          image: 'image.png',
          upload: 'image',
        },
        class_type: 'LoadImage',
        _meta: {
          title: 'Load Image',
        },
      },
      '24': {
        inputs: {
          frame_rate: 14,
          loop_count: 0,
          filename_prefix: 'svd',
          format: 'video/h264-mp4',
          pix_fmt: 'yuv420p',
          crf: 19,
          save_metadata: true,
          pingpong: false,
          save_output: true,
          images: ['8', 0],
        },
        class_type: 'VHS_VideoCombine',
        _meta: {
          title: 'Video Combine 🎥🅥🅗🅢',
        },
      },
    };
  }

  private async uploadImage(
    fileName: string,
    imageUrl: string,
  ): Promise<string> {
    try {
      const blob = await this.urlToBlob(imageUrl);

      const formData = new FormData();
      const file = new File([blob], fileName, { type: blob.type });

      formData.append('image', file, file.name);
      formData.append('overwrite', 'true');

      const url = `${this.comfyServerUrl}/upload/image`;

      await axios({
        url,
        method: 'POST',
        data: formData,
      });

      return file.name;
    } catch (error) {
      throw new Error(
        'Error uploading image to comfyUI server: ' + error,
      );
    }
  }

  private async promptImgToVideo(prompt: Record<string, any>): Promise<string> {
    try {
      const url = `${this.comfyServerUrl}/prompt`;
      const promptResponse = await axios({
        url,
        method: 'POST',
        headers: {
          Accept: 'application/json',
          ContentType: 'application/json',
        },
        data: JSON.stringify({
          prompt,
        }),
      });

      if (!promptResponse?.data?.prompt_id) {
        throw new Error('Prompting request was failed');
      }

      return promptResponse?.data?.prompt_id;
    } catch (error) {
      throw new Error('Error prompting failed: ' + error);
    }
  }

  private async getHistory(
    promptId: string,
  ): Promise<{ status: string; data: any | string }> {
    try {
      const response = await axios({
        url: `${this.comfyServerUrl}/history/${promptId}`,
        method: 'GET',
      });

      if (Object.keys(response?.data).length <= 0) {
        return {
          status: 'pending',
          data: 'Prompt is still being processed, please try again',
        };
      }

      if (response?.data[promptId]?.status?.status_str === 'error') {
        return {
          status: 'failed',
          data: `Prompt was failed due to an error`,
        };
      }

      return {
        status: 'success',
        data: response.data[promptId],
      };
    } catch (error) {
      return {
        status: 'failed',
        data: `Prompt was failed due to an error (${error})`,
      };
    }
  }

  async getVideoPromptResponse(
    promptId: string,
  ): Promise<{ status: string; data: string[] | string }> {
    try {
      const { status, data } = await this.getHistory(promptId);

      if (status !== 'success') {
        return { status, data: data as string };
      }

      const { outputs } = data;

      const fileUrls = [];
      for (const nodeId of Object.keys(outputs)) {
        const nodeOutput = outputs[nodeId];

        if (nodeOutput?.gifs) {
          for (const gif of nodeOutput?.gifs) {
            const params = new URLSearchParams({
              filename: gif.filename,
              subfolder: gif.subfolder,
              type: gif.type,
            });
            const outputFileUrl = `${this.comfyServerUrl}/view?${params}`;

            fileUrls.push(outputFileUrl);
          }
        }
      }

      return {
        status,
        data: fileUrls,
      };
    } catch (error) {
      return {
        status: 'failed',
        data: `Prompt was failed due to an error (${error})`,
      };
    }
  }

  async promptImageToVideo(
    imageUrl: string,
    outputType: OutputType,
    seeds: number,
    videoOutputType: VideoOutputType = '2D',
  ): Promise<string> {
    const imageName = `image-${new Date().getTime()}`;

    const filePath = await this.uploadImage(imageName, imageUrl);

    let promptId: string | null;

    if (videoOutputType === '2D') {
      const workflowInfo = this.getImageToVideoWorkflow();

      workflowInfo['3'].inputs.seed = seeds;
      workflowInfo['23'].inputs.image = filePath;
      workflowInfo['24'].inputs.filename_prefix =
        `${outputType}_${new Date().getTime()}_`;
      workflowInfo['24'].inputs.format =
        outputType === 'GIF'
          ? imgToVideoOutputFormats[0]
          : imgToVideoOutputFormats[1];

      promptId = await this.promptImgToVideo(workflowInfo);
    } else {
      const workflowInfo = this.getImageTo3DVideoWorkflow();

      workflowInfo['3'].inputs.seed = seeds;
      workflowInfo['12'].inputs.image = filePath;
      workflowInfo['22'].inputs.filename_prefix =
        `${outputType}_${new Date().getTime()}_`;
      workflowInfo['22'].inputs.format =
        outputType === 'GIF'
          ? imgToVideoOutputFormats[0]
          : imgToVideoOutputFormats[1];

      promptId = await this.promptImgToVideo(workflowInfo);
    }

    return promptId;
  }

  async urlToBlob(fileUrl: string): Promise<Blob> {
    try {
      const response = await axios({
        url: fileUrl,
        method: 'GET',
        responseType: 'stream',
      });

      const chunks: any = [];

      response.data.on('data', (chunk: any) => {
        chunks.push(chunk);
      });

      return new Promise((resolve, reject) => {
        response.data.on('end', () => {
          const buffer = Buffer.concat(chunks);
          const blob = new Blob([buffer]);
          resolve(blob);
        });

        response.data.on('error', (error: any) => {
          reject(error);
        });
      });
    } catch (error) {
      throw new Error(
        'Error converting URL to Blob: ' + error,
      );
    }
  }
}