<!-- ./src/components/ImageCropper.vue -->
<template>
  <!-- 头像上传触发按钮 -->
  <div class="avatar-upload-trigger" @click="openUpload">
    <slot name="trigger">
      <div class="info-avatar-uploader">
        <img
            v-if="previewUrl"
            :src="previewUrl"
            class="info-avatar"
            alt="预览"
        />
        <i v-else class="el-icon-plus info-avatar-uploader-icon"></i>
      </div>
    </slot>
  </div>

  <!-- 裁剪弹窗 -->
  <el-dialog
      title="调整头像尺寸"
      v-model="isCropModalOpen"
      width="500px"
      :close-on-click-modal="false"
      :destroy-on-close="true"
  >
    <!-- 修复：移除标签内注释，确保标签正确自闭和 -->
    <div class="cropper-container">
      <vue-cropper
          ref="cropperRef"
          :img="option.img"
          :output-size="option.outputSize"
          :output-type="option.outputType"
          :info="false"
          :full="option.full"
          :fixed="true"
          :fixed-number="[1, 1]"
          :can-move="option.canMove"
          :can-move-box="option.canMoveBox"
          :fixed-box="option.fixedBox"
          :original="option.original"
          :auto-crop="option.autoCrop"
          :auto-crop-width="option.autoCropWidth"
          :auto-crop-height="option.autoCropHeight"
          :center-box="option.centerBox"
          :high="option.high"
          @img-load="imgLoad"
          mode="contain"
          :max-img-size="option.max"
      />
    </div>

    <!-- 预览区域 -->
    <div class="preview-container" v-if="previews.url">
      <p class="preview-title">裁剪预览（200x200）</p>
      <div :style="{'width': previews.w + 'px', 'height': previews.h + 'px', 'overflow': 'hidden', 'margin': '0 auto'}">
        <div :style="previews.div">
          <img :src="previews.url" :style="previews.img" alt="预览">
        </div>
      </div>
    </div>

    <template #footer>
      <button type="button" class="info-btn info-cancel-btn" @click="closeCropModal">取消</button>
      <button type="button" class="info-btn info-submit-btn" @click="confirmCrop">确认裁剪</button>
    </template>
  </el-dialog>

  <!-- 隐藏的文件上传输入框 -->
  <input
      type="file"
      ref="fileInputRef"
      style="position:absolute; clip:rect(0 0 0 0);"
      accept="image/png, image/jpeg, image/gif, image/jpg, image/webp"
      @change="uploadImg"
  />
</template>

<script setup lang="ts">
import { ref, onUnmounted, watch } from 'vue'
import { VueCropper } from 'vue-cropper'

import 'vue-cropper/dist/index.css'
import type { UnknownResponse } from '@/api'
import { formatAvatarUrl } from '@/utils/common/format.js'

interface CropperOption {
  img: string
  size: number
  outputSize: number
  outputType: string
  full: boolean
  canMove: boolean
  canMoveBox: boolean
  fixedBox: boolean
  original: boolean
  autoCrop: boolean
  autoCropWidth: number
  autoCropHeight: number
  centerBox: boolean
  high: boolean
  max: number
}

interface PreviewData {
  url: string
  w: number
  h: number
  div: Record<string, string>
  img: Record<string, string>
}

// Props
interface Props {
  /** 头像URL (v-model) */
  modelValue?: string
  /** 裁剪尺寸 */
  size?: number
}

const props = withDefaults(defineProps<Props>(), {
  size: 200
})

// Emits
interface Emits {
  /** 更新头像URL */
  'update:modelValue': [value: string]
  /** 裁剪完成，文件就绪 */
  'cropped-file-ready': [file: File]
  /** 上传失败 */
  'upload-fail': [error: string]
}

const emit = defineEmits<Emits>()

// 状态
const isCropModalOpen = ref(false)
const previewUrl = ref(formatAvatarUrl(props.modelValue) || '')
const cropperRef = ref<UnknownResponse | null>(null)
const fileInputRef = ref<HTMLInputElement | null>(null)
const tempBlobUrls = ref<string[]>([])
const previews = ref<PreviewData>({} as PreviewData)

// 核心配置项
const option = ref<CropperOption>({
  img: '',
  size: 1,
  outputType: 'jpeg',
  full: false,
  canMove: true,
  canMoveBox: true,
  fixedBox: true,
  original: false,
  autoCrop: true,
  autoCropWidth: props.size,
  autoCropHeight: props.size,
  centerBox: true,
  high: true,
  max: 2 * 1024 * 1024,
});

// 打开文件选择
const openUpload = () => {
  fileInputRef.value.click();
};

// 上传图片
const uploadImg = (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    emit('upload-fail', '仅支持JPG、PNG、WebP格式图片')
    target.value = ''
    return
  }
  if (file.size > option.value.max) {
    emit('upload-fail', '文件大小不能超过2MB')
    target.value = ''
    return
  }

  const reader = new FileReader()
  reader.onload = (e) => {
    let data: string
    if (typeof e.target?.result === 'object') {
      data = window.URL.createObjectURL(new Blob([e.target.result]))
      tempBlobUrls.value.push(data)
    } else {
      data = e.target?.result as string
    }
    option.value.img = data
    isCropModalOpen.value = true
  }
  reader.readAsArrayBuffer(file)
  target.value = ''
}

// 图片加载完成回调
const imgLoad = (msg: string) => {
  console.log('图片加载完成：', msg)
}

// 确认裁剪
const confirmCrop = () => {
  const cropper = cropperRef.value;
  if (!cropper || !option.value.img) {
    emit('upload-fail', '请先选择图片');
    return;
  }

  try {
    cropper.getCropBlob((blob) => {
      if (!blob) {
        emit('upload-fail', '裁剪失败，无法生成图片');
        return;
      }

      const croppedFile = new File([blob], `avatar_${Date.now()}.${option.value.outputType}`, {
        type: `image/${option.value.outputType}`,
        lastModified: Date.now(),
      });

      const previewBlobUrl = URL.createObjectURL(blob);
      previewUrl.value = previewBlobUrl;
      tempBlobUrls.value.push(previewBlobUrl);

      emit('update:modelValue', previewBlobUrl);
      emit('cropped-file-ready', croppedFile);
      closeCropModal();
    });
  } catch (error) {
    emit('upload-fail', `裁剪失败：${error.message}`);
  }
};

// 关闭弹窗
const closeCropModal = () => {
  isCropModalOpen.value = false;
  tempBlobUrls.value.forEach(url => URL.revokeObjectURL(url));
  tempBlobUrls.value = [];
  option.value.img = '';
  previews.value = {};
};

// 组件卸载
onUnmounted(() => {
  tempBlobUrls.value.forEach(url => URL.revokeObjectURL(url));
  const cropper = cropperRef.value;
  if (cropper) cropper.destroy();
});

// 监听父组件传入的URL
watch(
    () => props.modelValue,
    (newVal) => {
      previewUrl.value = formatAvatarUrl(newVal) || '';
    },
    { immediate: true }
);
</script>

<style scoped>
.avatar-upload-trigger {
  cursor: pointer;
  display: inline-block;
}

.info-avatar-uploader {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px dashed #dcdfe6;
  position: relative;
}

.info-avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100%;
  height: 100%;
  line-height: 100px;
  text-align: center;
}

.info-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cropper-container {
  width: 100%;
  height: 350px;
  margin: 0 auto;
  background-color: #f8f9fa;
  border-radius: 8px;
  overflow: hidden;
}

.preview-container {
  margin: 15px 0;
}

.preview-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
  text-align: center;
}

.info-btn {
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  cursor: pointer;
  color: #fff;
  font-size: 14px;
}

.info-submit-btn {
  background-color: #67C23A;
  margin-right: 12px;
}

.info-cancel-btn {
  background-color: #909399;
}

/* 裁剪组件样式适配 */
:deep(.cropper-view-box) {
  border: 2px solid #409EFF !important;
}

:deep(.cropper-line) {
  background-color: #409EFF !important;
}

:deep(.cropper-point) {
  background-color: #409EFF !important;
}



</style>