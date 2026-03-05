import { ElMessage, ElMessageBox } from 'element-plus';
import { ref, reactive, computed } from 'vue';

import { userAdapter } from '@/services/userAdapter';
import { uploadImage } from '@/utils/upload.js';

/**
 * 公共表单验证规则（支持角色选项自定义）
 * @param {Array} roleOptions - 角色选项数组（[{label, value}]）
 * @returns {Object} 表单验证规则
 */
export const getCommonFormRules = (roleOptions = []) => {
    return reactive({
        account: [
            { required: true, message: '请输入账号', trigger: 'blur' },
            { min: 2, max: 20, message: '账号长度2-20字符', trigger: 'blur' }
        ],
        password: [
            { required: false, message: '请输入密码', trigger: 'blur' },
            { min: 6, max: 32, message: '密码长度6-32字符', trigger: 'blur' }
        ],
        username: [
            { required: true, message: '请输入用户名称', trigger: 'blur' },
            { min: 2, max: 20, message: '用户名称长度2-20字符', trigger: 'blur' }
        ],
        phone: [
            { required: true, message: '电话不能为空', trigger: 'blur' },
            { pattern: /^1[3-9]\d{9}$|^0\d{2,3}-\d{7,8}$/, message: '请输入正确的手机号或固定电话', trigger: 'blur' }
        ],
        email: [
            { pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message: '请输入正确的邮箱格式', trigger: 'blur' }
        ],
        role: roleOptions.length
            ? [{ required: true, message: '请选择角色', trigger: 'change' }]
            : []
    });
};

/**
 * 头像处理公共逻辑
 * @param {Object} form - 表单数据ref对象
 * @param {Object} errorMessage - 错误信息ref对象
 * @returns {Function} 头像变更处理函数
 */
export const useAvatarHandler = (form, errorMessage) => {
    const handleAvatarChange = (uploadFile) => {
        if (uploadFile.size > 2 * 1024 * 1024) {
            errorMessage.value = '文件大小不能超过2MB';
            return;
        }
        const fileType = uploadFile.raw.type;
        if (!['image/jpeg', 'image/png'].includes(fileType)) {
            errorMessage.value = '仅支持JPG、PNG格式图片';
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            form.value.avatar = e.target.result;
            errorMessage.value = '';
        };
        reader.readAsDataURL(uploadFile.raw);
        form.value.avatarFile = uploadFile.raw;
    };
    return handleAvatarChange;
};

/**
 * 列表页公共逻辑
 * @param {String} tableName - 数据表名（admin_info/user_info）
 * @param {String} listApi - 列表查询接口（可选）
 * @returns {Object} 列表页所需状态和方法
 */
export const useListCommonLogic = (tableName, listApi = '') => {
    const queryParams = ref({ account: '' });
    const currentPage = ref(1);
    const pageSize = ref(10);
    const total = ref(0);
    const totalPage = computed(() => Math.ceil(total.value / pageSize.value));
    const selectedIds = ref([]);
    const tableData = ref([]);
    const showTable = ref(false);
    const errorMessage = ref('');
    const defaultFields = ref({
        id: { label: 'ID', width: 80 },
        username: { label: '用户名称', width: 120 },
        account: { label: '账号', width: 120 },
        phone: { label: '电话', width: 150 },
        email: { label: '邮箱', width: 200 },
        avatar: { label: '头像', width: 100 },
        role: { label: '角色', width: 100 }
    });
    const tableFields = ref(defaultFields.value);

    const handleSelectionChange = (val) => {
        selectedIds.value = val.map(item => item.id);
    };

    const fetchData = async () => {
        showTable.value = false;
        try {
            // 核心：过滤空字符串、null、undefined的查询条件
            const filteredKwargs = Object.fromEntries(
                Object.entries(queryParams.value).filter(([, value]) =>
                    value !== '' && value != null && value !== undefined
                )
            );

            // 使用 userAdapter 适配器，支持 Mock 模式自动切换
            const result = await userAdapter.getUserList({
                page: currentPage.value,
                size: pageSize.value,
                keyword: filteredKwargs.account || '',
                role: filteredKwargs.role
            });

            console.log(`🔍 [${tableName}] 适配器响应:`, result);

            // 检查响应是否成功
            if (result?.success && result?.data) {
                const resData = result.data;
                console.log(`✅ [${tableName}] 解析后的resData:`, resData);

                tableFields.value = resData.fields || defaultFields.value;
                tableData.value = resData.items || [];
                total.value = resData.total || tableData.value.length;
                showTable.value = true;
                errorMessage.value = '';

                console.log(`✅ [${tableName}] 最终数据 - tableData:`, tableData.value.length, '条, total:', total.value);
            } else {
                console.error(`❌ [${tableName}] 响应失败 - result.success:`, result?.success);
                throw new Error(result?.message || '查询失败');
            }
        } catch (error) {
            errorMessage.value = error.response?.data?.message || error.message || '网络错误';
            showTable.value = false;
            console.error(`${tableName}查询失败：`, error);
        }
    };

    const handleQuery = () => {
        currentPage.value = 1;
        fetchData();
    };

    const handleReset = () => {
        queryParams.value.account = '';
        currentPage.value = 1;
        fetchData();
    };

    const handleDelete = async (id) => {
        try {
            await ElMessageBox.confirm(
                `确定删除该${tableName === 'admin_info' ? '管理员' : '用户'}吗？`,
                '提示',
                {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }
            );
        } catch {
            return;
        }

        try {
            // 使用 userAdapter 适配器，支持 Mock 模式自动切换
            const result = await userAdapter.deleteUser(id);

            if (result?.success) {
                ElMessage.success('删除成功');
                fetchData();
            } else {
                errorMessage.value = result?.message || '删除失败';
            }
        } catch (error) {
            let errorMsg = '删除失败';

            // 针对外键约束错误提供更友好的提示
            if (error.response?.data?.message && error.response.data.message.includes('foreign key constraint')) {
                errorMsg = `删除失败：该${tableName === 'admin_info' ? '管理员' : '用户'}有关联数据，无法直接删除。\n建议：\n1. 先删除或转移该用户的关联数据\n2. 或使用软删除功能标记该用户为已删除`;
            } else if (error.response?.data?.message) {
                errorMsg = error.response.data.message;
            } else if (error.message) {
                errorMsg = `删除失败：${error.message}`;
            }

            errorMessage.value = errorMsg;
            console.error('删除失败：', error);
        }
    };

    const handleBatchDelete = async () => {
        if (selectedIds.value.length === 0) {
            ElMessage.warning(`请选择要删除的${tableName === 'admin_info' ? '管理员' : '用户'}`);
            return;
        }

        try {
            await ElMessageBox.confirm(
                `确定删除选中的${selectedIds.value.length}条记录吗？`,
                '提示',
                {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }
            );
        } catch {
            return;
        }

        try {
            // 使用 userAdapter 适配器，支持 Mock 模式自动切换
            const result = await userAdapter.batchDeleteUsers(selectedIds.value);

            if (result?.success) {
                ElMessage.success(result.message || '批量删除成功');
                selectedIds.value = [];
                fetchData();
            } else {
                errorMessage.value = result?.message || '批量删除失败';
            }
        } catch (error) {
            let errorMsg = '批量删除失败';

            if (error.response?.data?.message) {
                errorMsg = error.response.data.message;
            } else if (error.message) {
                errorMsg = `批量删除失败：${error.message}`;
            }

            errorMessage.value = errorMsg;
            console.error('批量删除失败：', error);
        }
    };

    const handlePageChange = (page) => {
        currentPage.value = page;
        fetchData();
    };

    return {
        queryParams, currentPage, total, totalPage,
        selectedIds, tableData, showTable, errorMessage, tableFields,
        handleSelectionChange, fetchData, handleQuery, handleReset,
        handleDelete, handleBatchDelete, handlePageChange
    };
};

/**
 * 新增/编辑页公共提交逻辑
 * @param {String} tableName - 数据表名
 * @param {Object} form - 表单数据ref
 * @param {Object} formRef - 表单引用ref
 * @param {Object} isLoading - 加载状态ref
 * @param {Object} errorMessage - 错误信息ref
 * @param {Function} routerPush - 跳转函数
 * @param {String} id - 编辑页ID（新增为空）
 * @returns {Function} 提交处理函数
 */
export const useSubmitCommonLogic = (tableName, form, formRef, isLoading, errorMessage, routerPush, id = '') => {
    const handleSubmit = async () => {
        const valid = await formRef.value.validate().catch(() => false);
        if (!valid) return;

        isLoading.value = true;
        errorMessage.value = '';
        try {
            // 如果有新上传的文件，先上传图片
            if (form.value.avatarFile) {
                form.value.avatar = await uploadImage(form.value.avatarFile);
            }

            if (!id) {
                // 新增操作 - 使用 userAdapter 适配器
                const createData = {
                    account: form.value.account,
                    username: form.value.username,
                    phone: form.value.phone,
                    email: form.value.email,
                    role: form.value.role,
                    avatar: form.value.avatar
                };

                // 根据表名选择适配器方法
                const result = tableName === 'admin_info'
                    ? await userAdapter.createAdmin(createData)
                    : await userAdapter.createUser(createData);

                if (result?.success) {
                    ElMessage.success(`新增${tableName === 'admin_info' ? '管理员' : '用户'}成功！`);
                    routerPush();
                } else {
                    throw new Error(result?.message || '新增失败');
                }
            } else {
                // 编辑操作 - 使用 userAdapter 适配器
                const updateData = {
                    username: form.value.username,
                    email: form.value.email,
                    phone: form.value.phone,
                    avatar: form.value.avatar
                };

                // 如果修改了角色，也更新角色
                if (form.value.role) {
                    updateData.role = form.value.role;
                }

                const result = await userAdapter.updateUser(parseInt(id), updateData);

                if (result?.success) {
                    ElMessage.success(`修改${tableName === 'admin_info' ? '管理员' : '用户'}成功！`);
                    routerPush();
                } else {
                    throw new Error(result?.message || '修改失败');
                }
            }
        } catch (error) {
            errorMessage.value = error.response?.data?.message || error.message || '网络错误';
            console.error(`${id ? '修改' : '新增'}失败：`, error);
        } finally {
            isLoading.value = false;
        }
    };
    return handleSubmit;
};

/**
 * 编辑页加载数据公共逻辑
 * @param {String} tableName - 数据表名
 * @param {String} id - 记录ID
 * @param {Object} form - 表单数据ref
 * @param {Object} isLoading - 加载状态ref
 * @param {Object} errorMessage - 错误信息ref
 * @param {Object} isLoaded - 加载完成状态ref
 */
export const fetchEditData = async (tableName, id, form, isLoading, errorMessage, isLoaded) => {
    if (!id) {
        errorMessage.value = `缺少${tableName === 'admin_info' ? '管理员' : '用户'}ID，无法编辑`;
        return;
    }

    isLoading.value = true;
    try {
        // 使用 userAdapter 适配器，支持 Mock 模式自动切换
        const result = await userAdapter.getUserDetail(parseInt(id));

        if (result?.success && result?.data) {
            const data = result.data;
            form.value = { ...data, password: '' };
            isLoaded.value = true;
            errorMessage.value = '';
        } else {
            throw new Error(result?.message || `未查询到该${tableName === 'admin_info' ? '管理员' : '用户'}信息`);
        }
    } catch (error) {
        errorMessage.value = error.response?.data?.message || error.message || '数据加载失败';
        console.error(`加载${tableName === 'admin_info' ? '管理员' : '用户'}数据失败：`, error);
    } finally {
        isLoading.value = false;
    }
};